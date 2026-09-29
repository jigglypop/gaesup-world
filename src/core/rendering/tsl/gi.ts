import * as THREE from 'three';
import {
  materialColor,
  min,
  mix,
  normalWorld,
  positionWorld,
  step,
  texture3D,
  uniform,
} from 'three/tsl';
import type { MeshStandardNodeMaterial, Node } from 'three/webgpu';

import type { ProbeFaceBuffers, ProbeVolumeConfig, VoxelDims } from '../../gi/types';
import type { GiIrradiance } from './types';

const TEXEL_STRIDE = 4;
const HALF = 0.5;
const WEIGHT_FLOOR = 1e-6;
const FAR = 1e9;
const PLACEHOLDER_DIMS: VoxelDims = [1, 1, 1];

type ProbeTexture = { texture: THREE.Data3DTexture; data: Uint16Array };

function createProbeTexture(dims: VoxelDims): ProbeTexture {
  const data = new Uint16Array(dims[0] * dims[1] * dims[2] * TEXEL_STRIDE);
  const texture = new THREE.Data3DTexture(data, dims[0], dims[1], dims[2]);
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

function writeHalfFloats(target: Uint16Array, source: Float32Array): void {
  const count = Math.min(target.length, source.length);
  for (let index = 0; index < count; index++) {
    target[index] = THREE.DataUtils.toHalfFloat(source[index] ?? 0);
  }
}

/**
 * 프로브 조도 큐브 한 레벨(면마다 RGBA 3D 텍스처 1장, 순서 +x -x +y -y +z -z)을 하드웨어 삼선형 보간으로 읽어
 * 표면 법선 방향의 조도/PI를 계산한다. CPU의 evaluateAmbientCube와 같은 n^2 가중 평균이다.
 */
function createLevel(shifted: Node<'vec3'>) {
  const origin = uniform(new THREE.Vector3());
  const inverseSpacing = uniform(1);
  const inverseCounts = uniform(new THREE.Vector3(1, 1, 1));
  const coordinates = shifted.sub(origin).mul(inverseSpacing).add(HALF).mul(inverseCounts);
  const createFace = () => {
    const probe = createProbeTexture(PLACEHOLDER_DIMS);
    return { ...probe, node: texture3D(probe.texture, coordinates) };
  };
  const faces = [
    createFace(),
    createFace(),
    createFace(),
    createFace(),
    createFace(),
    createFace(),
  ] as const;
  let dims: VoxelDims = PLACEHOLDER_DIMS;

  const weights = normalWorld.mul(normalWorld);
  const total = weights.x.add(weights.y).add(weights.z).max(WEIGHT_FLOOR);
  const alongX = mix(faces[1].node.rgb, faces[0].node.rgb, step(0, normalWorld.x));
  const alongY = mix(faces[3].node.rgb, faces[2].node.rgb, step(0, normalWorld.y));
  const alongZ = mix(faces[5].node.rgb, faces[4].node.rgb, step(0, normalWorld.z));
  const irradiance = alongX
    .mul(weights.x)
    .add(alongY.mul(weights.y))
    .add(alongZ.mul(weights.z))
    .div(total);

  const replaceTextures = (next: VoxelDims) => {
    for (const face of faces) {
      const probe = createProbeTexture(next);
      face.texture.dispose();
      face.texture = probe.texture;
      face.data = probe.data;
      face.node.value = probe.texture;
    }
    dims = next;
  };

  return {
    irradiance,
    upload: (config: ProbeVolumeConfig, data: ProbeFaceBuffers) => {
      const counts = config.counts;
      if (counts[0] !== dims[0] || counts[1] !== dims[1] || counts[2] !== dims[2]) {
        replaceTextures(counts);
      }
      faces.forEach((face, index) => {
        const source = data[index];
        if (source) writeHalfFloats(face.data, source);
        face.texture.needsUpdate = true;
      });
      origin.value.set(config.origin.x, config.origin.y, config.origin.z);
      inverseSpacing.value = 1 / config.spacing;
      inverseCounts.value.set(1 / counts[0], 1 / counts[1], 1 / counts[2]);
    },
    dispose: () => {
      for (const face of faces) face.texture.dispose();
    },
  };
}

const appliedMaterials = new WeakSet<object>();

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
    applyToMaterial: (material: MeshStandardNodeMaterial) => {
      if (appliedMaterials.has(material)) return;
      appliedMaterials.add(material);
      const bounced = materialColor.mul(irradiance);
      material.emissiveNode = material.emissiveNode ? material.emissiveNode.add(bounced) : bounced;
      material.needsUpdate = true;
    },
    dispose: () => {
      coarse.dispose();
      fine.dispose();
    },
  };
}
