export { GiVolume } from './components/GiVolume';
export type { GiVolumeProps } from './components/GiVolume/types';
export { hexToLinearRgb } from './core/color';
export { GiContext, useGi } from './hooks/useGi';
export { useBuildingVoxelBoxes } from './hooks/useBuildingVoxelBoxes';
export { buildingToVoxelBoxes } from './utils/buildingVoxelBoxes';
export type { BuildingVoxelSource } from './utils/types';
export type { GiIrradiance } from '../rendering/tsl/types';
export { ProbeCascade } from './core/probeCascade';
export { ProbeVolume } from './core/probeVolume';
export {
  cosineHemisphereDirection,
  fibonacciSphereDirection,
  orientToNormal,
  r2Sample,
  rotationFromSample,
} from './core/sampling';
export {
  CUBE_CHANNELS,
  CUBE_FACE_COUNT,
  CUBE_STRIDE,
  accumulateAmbientCube,
  evaluateAmbientCube,
} from './core/cube';
export { createVoxelHitScratch, traceVoxelRay, traceVoxelRayInto } from './core/traceVoxels';
export {
  DEFAULT_MATERIAL_ID,
  MAX_MATERIAL_ID,
  clearVoxelGrid,
  createVoxelGrid,
  fillVoxelBox,
  isInsideVoxelGrid,
  isVoxelOccupied,
  registerVoxelMaterial,
  resetVoxelMaterials,
  voxelIndex,
  voxelMaterialId,
} from './core/voxelGrid';
export {
  alignedProbeLayout,
  computeBoxBounds,
  computeGridSpec,
  createGridForBounds,
  expandBounds,
  rebuildVoxelGrid,
} from './core/voxelScene';
export type {
  Aabb,
  FieldSampler,
  GiEnvironment,
  Mat3,
  MutableRgb,
  ProbeFaceBuffers,
  ProbeLevelUpload,
  ProbeVolumeConfig,
  Rgb,
  VoxelDims,
  VoxelGrid,
  VoxelHitScratch,
  VoxelMaterial,
  VoxelRayHit,
  VoxelSourceBox,
} from './types';
