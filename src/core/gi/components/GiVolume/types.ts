import type { ReactNode } from 'react';

import type { ProbeCascade } from '../../core/probeCascade';
import type { Aabb, GiEnvironment, ProbeFaceBuffers, VoxelGrid, VoxelSourceBox } from '../../types';

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
  exportBuffers: ProbeFaceBuffers[];
  uploadedVersion: number;
};
