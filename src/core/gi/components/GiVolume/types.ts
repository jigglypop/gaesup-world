import type { ReactNode } from 'react';

import type { ProbeCascade } from '../../core/probeCascade';
import type { Aabb, GiEnvironment, VoxelGrid, VoxelSourceBox } from '../../types';

export type GiVolumeProps = {
  boxes: readonly VoxelSourceBox[];
  environment: GiEnvironment;
  fineBounds?: Aabb;
  voxelSize?: number;
  probeSpacing?: number;
  raysPerProbe?: number;
  probesPerFrame?: number;
  padding?: number;
  blend?: number;
  uploadIntervalMs?: number;
  /**
   * Trace probes in a Web Worker so the frame never waits for them (default). Where a worker cannot start (no Worker,
   * a content security policy without blob: workers) or it fails, the probes update on the main thread as before.
   */
  worker?: boolean;
  children?: ReactNode;
};

export type GiRuntimeParams = {
  voxelSize: number;
  probeSpacing: number;
  raysPerProbe: number;
  padding: number;
  blend: number;
  fineBounds: Aabb | null;
};

export type GiRuntime = {
  signature: string;
  grid: VoxelGrid;
  cascade: ProbeCascade;
  /** Atlas arrays the renderer has let go of, packed again for the next upload. */
  spareAtlases: Uint16Array[];
  uploadedVersion: number;
};
