import type { Material } from 'three';
import type { Node } from 'three/webgpu';

import type { ProbeAtlasUpload, ProbeLevelUpload } from '../../gi/types';

export type GiIrradiance = {
  node: Node<'vec3'>;
  setIntensity: (value: number) => void;
  update: (levels: readonly ProbeLevelUpload[]) => void;
  /**
   * Takes levels already packed as half-float atlases (ProbeVolume.packAtlas) and draws with those arrays from now on.
   * Returns the arrays it stopped using, so the caller can pack the next upload into them.
   */
  updateAtlas: (levels: readonly ProbeAtlasUpload[]) => Uint16Array[];
  /** Adds the indirect light to a standard (PBR) material, classic or node; dispose() takes it off again. */
  applyToMaterial: (material: Material) => void;
  dispose: () => void;
};
