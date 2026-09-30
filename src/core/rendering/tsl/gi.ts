import * as THREE from 'three';
import {
  diffuseColor,
  float,
  Fn,
  If,
  materialEmissive,
  min,
  mix,
  normalWorld,
  positionWorld,
  select,
  texture3D,
  uniform,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import type { GiIrradiance } from './types';
import { PROBE_ATLAS_FACES, probeAtlasLength, writeFaceBuffersToAtlas } from '../../gi/core/probeAtlas';
import type { ProbeVolumeConfig, VoxelDims } from '../../gi/types';

const HALF = 0.5;
const WEIGHT_FLOOR = 1e-6;
const FAR = 1e9;
const PLACEHOLDER_DIMS: VoxelDims = [1, 1, 1];

type ProbeAtlas = { texture: THREE.Data3DTexture; data: Uint16Array };
/** Atlas arrays are always plain (never shared) buffers: packed here, by a worker, or transferred from one. */
type AtlasArray = Uint16Array<ArrayBuffer>;

/**
 * One RGBA half-float 3D texture per level, its six faces (+x -x +y -y +z -z) side by side along x. A single binding
 * keeps materials that already sample shadow cascades, an environment map and their own maps within WebGPU's
 * 16 sampled textures per stage.
 */
function createProbeAtlas(dims: VoxelDims, data: Uint16Array = new Uint16Array(probeAtlasLength(dims))): ProbeAtlas {
  const texture = new THREE.Data3DTexture(data as AtlasArray, dims[0] * PROBE_ATLAS_FACES, dims[1], dims[2]);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.HalfFloatType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.wrapR = THREE.ClampToEdgeWrapping;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return { texture, data };
}

/**
 * 프로브 조도 큐브 한 레벨(여섯 면을 x로 이어 붙인 RGBA 3D 텍스처 1장)을 하드웨어 삼선형 보간으로 읽어
 * 표면 법선 방향의 조도/PI를 계산한다. CPU의 evaluateAmbientCube와 같은 n^2 가중 평균이다.
 * 축마다 법선이 향하는 면 하나만 읽어 표본은 세 번이다(반대쪽 면은 가중치가 0이라 읽을 필요가 없다).
 */
function createLevel(shifted: Node<'vec3'>) {
  const origin = uniform(new THREE.Vector3());
  const inverseSpacing = uniform(1);
  const counts = uniform(new THREE.Vector3(1, 1, 1));
  // Probe texel position; x stays inside each face's own slab so filtering never reads the neighbouring face.
  const texel = shifted.sub(origin).mul(inverseSpacing).add(HALF);
  const slabX = texel.x.clamp(HALF, counts.x.sub(HALF));
  const atlasWidth = counts.x.mul(PROBE_ATLAS_FACES);
  const v = texel.y.div(counts.y);
  const w = texel.z.div(counts.z);
  let atlas = createProbeAtlas(PLACEHOLDER_DIMS);
  const atlasNode = texture3D(atlas.texture);
  // Explicit level 0 (the atlas has no mips) keeps the reads legal inside the fine level's branch below.
  const face = (axis: number, component: Node<'float'>) => {
    const slab = select(component.greaterThanEqual(0), float(axis * 2), float(axis * 2 + 1));
    return atlasNode.sample(vec3(slabX.add(counts.x.mul(slab)).div(atlasWidth), v, w)).level(float(0)).rgb;
  };
  let dims: VoxelDims = PLACEHOLDER_DIMS;

  const weights = normalWorld.mul(normalWorld);
  const total = weights.x.add(weights.y).add(weights.z).max(WEIGHT_FLOOR);
  const irradiance = face(0, normalWorld.x)
    .mul(weights.x)
    .add(face(1, normalWorld.y).mul(weights.y))
    .add(face(2, normalWorld.z).mul(weights.z))
    .div(total);

  const place = (config: ProbeVolumeConfig) => {
    const next = config.counts;
    origin.value.set(config.origin.x, config.origin.y, config.origin.z);
    inverseSpacing.value = 1 / config.spacing;
    counts.value.set(next[0], next[1], next[2]);
  };

  return {
    irradiance,
    /** Draws with `data` from now on and returns the array it replaced (null when the texture had to be rebuilt). */
    uploadAtlas: (config: ProbeVolumeConfig, data: Uint16Array): Uint16Array | null => {
      const next = config.counts;
      if (data.length !== probeAtlasLength(next)) {
        throw new RangeError('[GiIrradiance Error]: atlas size does not match the probe counts');
      }
      let released: Uint16Array | null = null;
      if (next[0] !== dims[0] || next[1] !== dims[1] || next[2] !== dims[2]) {
        const replaced = atlas;
        atlas = createProbeAtlas(next, data);
        atlasNode.value = atlas.texture;
        replaced.texture.dispose();
        dims = next;
      } else {
        released = atlas.data;
        atlas.data = data;
        atlas.texture.image.data = data as AtlasArray;
        atlas.texture.needsUpdate = true;
      }
      place(config);
      return released;
    },
    dispose: () => {
      atlas.texture.dispose();
    },
  };
}

/**
 * 성긴 프로브 레벨 위에 촘촘한 레벨을 섞는 2단계 캐스케이드 조도 노드를 만든다.
 * 촘촘한 레벨의 영역 경계에서는 간격만큼 서서히 성긴 값으로 넘어간다(CPU의 ProbeCascade.fineWeight와 같은 식).
 * 촘촘한 레벨은 그 영역 안의 픽셀에서만 읽는다: 월드 대부분에는 촘촘한 레벨이 없다.
 */
export function createGiIrradiance(): GiIrradiance {
  const normalBias = uniform(0);
  const intensity = uniform(1);
  const fineMin = uniform(new THREE.Vector3(FAR, FAR, FAR));
  const fineMax = uniform(new THREE.Vector3(-FAR, -FAR, -FAR));
  const fineFade = uniform(1);

  const shifted = positionWorld.add(normalWorld.mul(normalBias)) as Node<'vec3'>;
  const coarse = createLevel(shifted);
  const fine = createLevel(shifted);
  const edge = min(shifted.sub(fineMin), fineMax.sub(shifted)).div(fineFade).clamp(0, 1);
  const fineWeight = edge.x.mul(edge.y).mul(edge.z);
  const irradiance = Fn(() => {
    const blended = coarse.irradiance.toVar();
    If(fineWeight.greaterThan(0), () => {
      blended.assign(mix(blended, fine.irradiance, fineWeight));
    });
    return blended.mul(intensity);
  })() as Node<'vec3'>;

  // Every surface given indirect light, with the emissive it had, so dispose() can hand it back unchanged.
  const applied = new Map<THREE.Material, Node<'vec3'> | null | undefined>();
  // The albedo the surface shades with (colour, map, vertex colours or its own colorNode, less its metalness).
  const received = diffuseColor.rgb.mul(irradiance);

  const placeFine = (config: ProbeVolumeConfig | undefined) => {
    if (!config) {
      fineMin.value.set(FAR, FAR, FAR);
      fineMax.value.set(-FAR, -FAR, -FAR);
      return;
    }
    const { origin, spacing, counts } = config;
    fineMin.value.set(origin.x, origin.y, origin.z);
    fineMax.value.set(
      origin.x + (counts[0] - 1) * spacing,
      origin.y + (counts[1] - 1) * spacing,
      origin.z + (counts[2] - 1) * spacing,
    );
    fineFade.value = spacing;
  };

  const updateAtlas: GiIrradiance['updateAtlas'] = (levels) => {
    const released: Uint16Array[] = [];
    const coarseLevel = levels[0];
    if (!coarseLevel) return released;
    const keep = (array: Uint16Array | null) => {
      if (array) released.push(array);
    };
    keep(coarse.uploadAtlas(coarseLevel.config, coarseLevel.atlas));
    normalBias.value = coarseLevel.config.normalBias;
    const fineLevel = levels[1];
    if (fineLevel) keep(fine.uploadAtlas(fineLevel.config, fineLevel.atlas));
    placeFine(fineLevel?.config);
    return released;
  };

  return {
    node: irradiance,
    setIntensity: (value) => {
      intensity.value = value;
    },
    update: (levels) => {
      updateAtlas(
        levels.map(({ config, faces }) => {
          const atlas = new Uint16Array(probeAtlasLength(config.counts));
          writeFaceBuffersToAtlas(atlas, config.counts, faces);
          return { config, atlas };
        }),
      );
    },
    updateAtlas,
    applyToMaterial: (material) => {
      if (applied.has(material)) return;
      // Classic materials take it too: the renderer copies emissiveNode when it builds their node material.
      const surface = material as THREE.Material & { emissiveNode?: Node<'vec3'> | null };
      applied.set(material, surface.emissiveNode);
      surface.emissiveNode = (surface.emissiveNode ?? materialEmissive).add(received);
      material.needsUpdate = true;
    },
    dispose: () => {
      for (const [material, emissive] of applied) {
        const surface = material as THREE.Material & { emissiveNode?: Node<'vec3'> | null };
        if (emissive === undefined) delete surface.emissiveNode;
        else surface.emissiveNode = emissive;
        material.needsUpdate = true;
      }
      applied.clear();
      coarse.dispose();
      fine.dispose();
    },
  };
}
