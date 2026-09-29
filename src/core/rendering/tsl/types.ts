import type { MeshStandardNodeMaterial, Node } from 'three/webgpu';

import type { ProbeLevelUpload } from '../../gi/types';

export type GiIrradiance = {
  node: Node<'vec3'>;
  setIntensity: (value: number) => void;
  update: (levels: readonly ProbeLevelUpload[]) => void;
  applyToMaterial: (material: MeshStandardNodeMaterial) => void;
  dispose: () => void;
};
