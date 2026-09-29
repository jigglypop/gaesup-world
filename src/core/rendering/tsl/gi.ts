import * as THREE from 'three';
import {
  diffuseColor,
  materialEmissive,
  min,
  mix,
  normalWorld,
  positionWorld,
  step,
  texture3D,
  uniform,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import type { GiIrradiance } from './types';
import type { ProbeFaceBuffers, ProbeVolumeConfig, VoxelDims } from '../../gi/types';

const TEXEL_STRIDE = 4;
const HALF = 0.5;
const WEIGHT_FLOOR = 1e-6;
const FAR = 1e9;
const PLACEHOLDER_DIMS: VoxelDims = [1, 1, 1];

const FACE_COUNT = 6;

type ProbeAtlas = { texture: THREE.Data3DTexture; data: Uint16Array };

/**
 * One RGBA half-float 3D texture per level, its six faces (+x -x +y -y +z -z) side by side along x. A single binding
 * keeps materials that already sample shadow cascades, an environment map and their own maps within WebGPU's
 * 16 sampled textures per stage.
 */
function createProbeAtlas(dims: VoxelDims): ProbeAtlas {
  const width = dims[0] * FACE_COUNT;
  const data = new Uint16Array(width * dims[1] * dims[2] * TEXEL_STRIDE);
  const texture = new THREE.Data3DTexture(data, width, dims[1], dims[2]);
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

/** Writes each face's probe rows into its slab of the atlas, as half floats. */
function writeFaces(target: Uint16Array, dims: VoxelDims, faces: ProbeFaceBuffers): void {
  const rowLength = dims[0] * TEXEL_STRIDE;
  const rows = dims[1] * dims[2];
  for (let face = 0; face < FACE_COUNT; face++) {
    const source = faces[face];
    if (!source) continue;
    for (let row = 0; row < rows; row++) {
      const from = row * rowLength;
      const to = (row * FACE_COUNT + face) * rowLength;
      for (let index = 0; index < rowLength; index++) {
        target[to + index] = THREE.DataUtils.toHalfFloat(source[from + index] ?? 0);
      }
    }
  }
}

/**
 * 프로브 조도 큐브 한 레벨(여섯 면을 x로 이어 붙인 RGBA 3D 텍스처 1장)을 하드웨어 삼선형 보간으로 읽어
 * 표면 법선 방향의 조도/PI를 계산한다. CPU의 evaluateAmbientCube와 같은 n^2 가중 평균이다.
 */
function createLevel(shifted: Node<'vec3'>) {
  const origin = uniform(new THREE.Vector3());
  const inverseSpacing = uniform(1);
  const counts = uniform(new THREE.Vector3(1, 1, 1));
  // Probe texel position; x stays inside each face's own slab so filtering never reads the neighbouring face.
  const texel = shifted.sub(origin).mul(inverseSpacing).add(HALF);
  const slabX = texel.x.clamp(HALF, counts.x.sub(HALF));
  const atlasWidth = counts.x.mul(FACE_COUNT);
  const v = texel.y.div(counts.y);
  const w = texel.z.div(counts.z);
  let atlas = createProbeAtlas(PLACEHOLDER_DIMS);
  const atlasNode = texture3D(atlas.texture);
  const face = (index: number) => atlasNode.sample(vec3(slabX.add(counts.x.mul(index)).div(atlasWidth), v, w)).rgb;
  let dims: VoxelDims = PLACEHOLDER_DIMS;

  const weights = normalWorld.mul(normalWorld);
  const total = weights.x.add(weights.y).add(weights.z).max(WEIGHT_FLOOR);
  const alongX = mix(face(1), face(0), step(0, normalWorld.x));
  const alongY = mix(face(3), face(2), step(0, normalWorld.y));
  const alongZ = mix(face(5), face(4), step(0, normalWorld.z));
  const irradiance = alongX
    .mul(weights.x)
    .add(alongY.mul(weights.y))
    .add(alongZ.mul(weights.z))
    .div(total);

  return {
    irradiance,
    upload: (config: ProbeVolumeConfig, data: ProbeFaceBuffers) => {
      const next = config.counts;
      if (next[0] !== dims[0] || next[1] !== dims[1] || next[2] !== dims[2]) {
        const replaced = atlas;
        atlas = createProbeAtlas(next);
        atlasNode.value = atlas.texture;
        replaced.texture.dispose();
        dims = next;
      }
      writeFaces(atlas.data, dims, data);
      atlas.texture.needsUpdate = true;
      origin.value.set(config.origin.x, config.origin.y, config.origin.z);
      inverseSpacing.value = 1 / config.spacing;
      counts.value.set(next[0], next[1], next[2]);
    },
    dispose: () => {
      atlas.texture.dispose();
    },
  };
}

/**
 * 성긴 프로브 레벨 위에 촘촘한 레벨을 섞는 2단계 캐스케이드 조도 노드를 만든다.
 * 촘촘한 레벨의 영역 경계에서는 간격만큼 서서히 성긴 값으로 넘어간다(CPU의 ProbeCascade.fineWeight와 같은 식).
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
  const irradiance = mix(coarse.irradiance, fine.irradiance, fineWeight).mul(
    intensity,
  ) as Node<'vec3'>;

  // Every surface given indirect light, with the emissive it had, so dispose() can hand it back unchanged.
  const applied = new Map<THREE.Material, Node<'vec3'> | null | undefined>();
  // The albedo the surface shades with (colour, map, vertex colours or its own colorNode, less its metalness).
  const received = diffuseColor.rgb.mul(irradiance);

  return {
    node: irradiance,
    setIntensity: (value) => {
      intensity.value = value;
    },
    update: (levels) => {
      const coarseLevel = levels[0];
      if (!coarseLevel) return;
      coarse.upload(coarseLevel.config, coarseLevel.faces);
      normalBias.value = coarseLevel.config.normalBias;
      const fineLevel = levels[1];
      if (!fineLevel) {
        fineMin.value.set(FAR, FAR, FAR);
        fineMax.value.set(-FAR, -FAR, -FAR);
        return;
      }
      fine.upload(fineLevel.config, fineLevel.faces);
      const { origin, spacing, counts } = fineLevel.config;
      fineMin.value.set(origin.x, origin.y, origin.z);
      fineMax.value.set(
        origin.x + (counts[0] - 1) * spacing,
        origin.y + (counts[1] - 1) * spacing,
        origin.z + (counts[2] - 1) * spacing,
      );
      fineFade.value = spacing;
    },
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
