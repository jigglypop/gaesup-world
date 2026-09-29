import type { Vec3 } from '../grid';

export type Rgb = readonly [number, number, number];
export type MutableRgb = [number, number, number];
export type VoxelDims = readonly [number, number, number];
export type Mat3 = [number, number, number, number, number, number, number, number, number];

export type VoxelMaterial = {
  albedo: Rgb;
  emissive: Rgb;
};

export type VoxelGrid = {
  readonly origin: Vec3;
  readonly voxelSize: number;
  readonly dims: VoxelDims;
  readonly occupancy: Uint8Array;
  readonly materials: VoxelMaterial[];
};

export type Aabb = {
  min: Vec3;
  max: Vec3;
};

export type VoxelSourceBox = Aabb & {
  albedo: Rgb;
  emissive?: Rgb;
};

export type VoxelRayHit = {
  distance: number;
  voxel: VoxelDims;
  normal: Vec3;
};

export type VoxelHitScratch = {
  distance: number;
  cellX: number;
  cellY: number;
  cellZ: number;
  normalX: number;
  normalY: number;
  normalZ: number;
};

export type GiEnvironment = {
  sunDirection: Vec3;
  sunIrradiance: Rgb;
  skyZenith: Rgb;
  skyHorizon: Rgb;
  skyGround: Rgb;
};

export type ProbeVolumeConfig = {
  origin: Vec3;
  spacing: number;
  counts: VoxelDims;
  raysPerProbe: number;
  blend: number;
  normalBias: number;
  maxRayDistance: number;
};

export type ProbeFaceBuffers = readonly [
  Float32Array,
  Float32Array,
  Float32Array,
  Float32Array,
  Float32Array,
  Float32Array,
];

export type FieldSampler = (
  px: number,
  py: number,
  pz: number,
  nx: number,
  ny: number,
  nz: number,
  out: MutableRgb,
) => void;

export type ProbeLevelUpload = {
  config: ProbeVolumeConfig;
  faces: ProbeFaceBuffers;
};
