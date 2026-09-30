import type { Mesh, Material } from 'three';

import type { GiEnvironment } from '../../types';
import type { GiVolumeProps } from '../GiVolume/types';

export type WorldGiProps = Omit<GiVolumeProps, 'boxes' | 'environment' | 'children'> & {
  /**
   * Sun and sky overrides. Anything left out follows the scene: its first shadow-casting directional light is the
   * sun and its first hemisphere light the sky, read twice a second.
   */
  environment?: Partial<GiEnvironment>;
  /** Scales the indirect light; 0 turns it off without rebuilding the probes. Defaults to 1. */
  intensity?: number;
  /**
   * Which surfaces take indirect light. Defaults to opaque standard (PBR) materials; a material or mesh with
   * `userData.gi = false` is always skipped.
   */
  receives?: (mesh: Mesh, material: Material) => boolean;
};
