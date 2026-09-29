import * as THREE from 'three';
import { materialColor, mix, normalWorld, positionWorld, step, texture3D, uniform } from 'three/tsl';
import type { MeshStandardNodeMaterial, Node } from 'three/webgpu';

import type { ProbeFaceBuffers, ProbeVolumeConfig, VoxelDims } from '../../gi/types';
import type { GiIrradiance } from './types';

const TEXEL_STRIDE = 4;
const HALF = 0.5;
const WEIGHT_FLOOR = 1e-6;
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

const appliedMaterials = new WeakSet<object>();

/**
 * 프로브 조도 큐브(면마다 RGBA 3D 텍스처 1장, 순서 +x -x +y -y +z -z)를 하드웨어 삼선형 보간으로 읽어
 * 표면 법선 방향의 간접 확산 조도/PI를 계산하는 TSL 노드를 만든다.
 * CPU의 evaluateAmbientCube와 같은 n^2 가중 평균이라 ProbeVolume.sample과 같은 값을 재현한다.
 */
export function createGiIrradiance(): GiIrradiance {
  const origin = uniform(new THREE.Vector3());
  const inverseSpacing = uniform(1);
  const inverseCounts = uniform(new THREE.Vector3(1, 1, 1));
  const normalBias = uniform(0);
  const intensity = uniform(1);

  const shifted = positionWorld.add(normalWorld.mul(normalBias));
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
    .div(total)
    .mul(intensity) as Node<'vec3'>;

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
    node: irradiance,
    setIntensity: (value) => {
      intensity.value = value;
    },
    update: (config: ProbeVolumeConfig, data: ProbeFaceBuffers) => {
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
      normalBias.value = config.normalBias;
    },
    applyToMaterial: (material: MeshStandardNodeMaterial) => {
      if (appliedMaterials.has(material)) return;
      appliedMaterials.add(material);
      const bounced = materialColor.mul(irradiance);
      material.emissiveNode = material.emissiveNode ? material.emissiveNode.add(bounced) : bounced;
      material.needsUpdate = true;
    },
    dispose: () => {
      for (const face of faces) face.texture.dispose();
    },
  };
}
