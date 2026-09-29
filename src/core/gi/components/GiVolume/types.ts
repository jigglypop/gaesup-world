import type { ReactNode } from 'react';

import type { ProbeVolume } from '../../core/probeVolume';
import type { GiEnvironment, ProbeFaceBuffers, VoxelGrid, VoxelSourceBox } from '../../types';

export type GiVolumeProps = {
  boxes: readonly VoxelSourceBox[];
  environment: GiEnvironment;
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
};

export type GiRuntime = {
  signature: string;
  grid: VoxelGrid;
  volume: ProbeVolume;
  exportBuffer: ProbeFaceBuffers;
  uploadedVersion: number;
};
