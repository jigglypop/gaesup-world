import type { MeshStandardNodeMaterial, Node } from 'three/webgpu';

import type { ProbeFaceBuffers, ProbeVolumeConfig } from '../../gi/types';

export type GiIrradiance = {
  node: Node<'vec3'>;
  setIntensity: (value: number) => void;
  update: (config: ProbeVolumeConfig, data: ProbeFaceBuffers) => void;
  applyToMaterial: (material: MeshStandardNodeMaterial) => void;
  dispose: () => void;
};
