import type { Material } from 'three';
import type { Node } from 'three/webgpu';

import type { ProbeLevelUpload } from '../../gi/types';

export type GiIrradiance = {
  node: Node<'vec3'>;
  setIntensity: (value: number) => void;
  update: (levels: readonly ProbeLevelUpload[]) => void;
  /** Adds the indirect light to a standard (PBR) material, classic or node; dispose() takes it off again. */
  applyToMaterial: (material: Material) => void;
  dispose: () => void;
};
