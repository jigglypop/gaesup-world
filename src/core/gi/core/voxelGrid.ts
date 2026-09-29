import type { Vec3 } from '../../grid';
import type { Aabb, VoxelDims, VoxelGrid, VoxelMaterial } from '../types';

const MAX_VOXEL_COUNT = 1 << 26;
const EMPTY = 0;

export const MAX_MATERIAL_ID = 255;
export const DEFAULT_MATERIAL_ID = 1;

const PLACEHOLDER_MATERIAL: VoxelMaterial = { albedo: [0, 0, 0], emissive: [0, 0, 0] };
const DEFAULT_MATERIAL: VoxelMaterial = { albedo: [0.5, 0.5, 0.5], emissive: [0, 0, 0] };

export function createVoxelGrid(origin: Vec3, voxelSize: number, dims: VoxelDims): VoxelGrid {
  if (!Number.isFinite(voxelSize) || voxelSize <= 0) {
    throw new RangeError('[VoxelGrid Error]: voxelSize must be a positive finite number');
  }
  if (![origin.x, origin.y, origin.z].every(Number.isFinite)) {
    throw new RangeError('[VoxelGrid Error]: origin must be finite');
  }
  const count = dims[0] * dims[1] * dims[2];
  if (
    !dims.every((dim) => Number.isInteger(dim) && dim > 0) ||
    !Number.isSafeInteger(count) ||
    count > MAX_VOXEL_COUNT
  ) {
    throw new RangeError('[VoxelGrid Error]: dims must be positive integers within the limit');
  }
  return {
    origin: { ...origin },
    voxelSize,
    dims,
    occupancy: new Uint8Array(count),
    materials: [PLACEHOLDER_MATERIAL, DEFAULT_MATERIAL],
  };
}

export function registerVoxelMaterial(grid: VoxelGrid, material: VoxelMaterial): number {
  if (grid.materials.length > MAX_MATERIAL_ID) {
    throw new RangeError('[VoxelGrid Error]: material palette is full');
  }
  grid.materials.push({ albedo: [...material.albedo], emissive: [...material.emissive] });
  return grid.materials.length - 1;
}

export function resetVoxelMaterials(grid: VoxelGrid): void {
  grid.materials.length = DEFAULT_MATERIAL_ID + 1;
}

export function voxelIndex(grid: VoxelGrid, x: number, y: number, z: number): number {
  return x + grid.dims[0] * (y + grid.dims[1] * z);
}

export function isInsideVoxelGrid(grid: VoxelGrid, x: number, y: number, z: number): boolean {
  return x >= 0 && y >= 0 && z >= 0 && x < grid.dims[0] && y < grid.dims[1] && z < grid.dims[2];
}

export function voxelMaterialId(grid: VoxelGrid, x: number, y: number, z: number): number {
  if (!isInsideVoxelGrid(grid, x, y, z)) return EMPTY;
  return grid.occupancy[voxelIndex(grid, x, y, z)] ?? EMPTY;
}

export function isVoxelOccupied(grid: VoxelGrid, x: number, y: number, z: number): boolean {
  return voxelMaterialId(grid, x, y, z) !== EMPTY;
}

export function clearVoxelGrid(grid: VoxelGrid): void {
  grid.occupancy.fill(EMPTY);
}

function voxelRange(
  min: number,
  max: number,
  origin: number,
  voxelSize: number,
  dim: number,
): readonly [number, number] | null {
  const lo = Math.floor((min - origin) / voxelSize);
  const hi = Math.max(lo, Math.ceil((max - origin) / voxelSize) - 1);
  if (hi < 0 || lo >= dim) return null;
  return [Math.max(lo, 0), Math.min(hi, dim - 1)];
}

export function fillVoxelBox(
  grid: VoxelGrid,
  box: Aabb,
  materialId: number = DEFAULT_MATERIAL_ID,
): void {
  const { origin, voxelSize, dims } = grid;
  const rangeX = voxelRange(box.min.x, box.max.x, origin.x, voxelSize, dims[0]);
  const rangeY = voxelRange(box.min.y, box.max.y, origin.y, voxelSize, dims[1]);
  const rangeZ = voxelRange(box.min.z, box.max.z, origin.z, voxelSize, dims[2]);
  if (!rangeX || !rangeY || !rangeZ) return;
  for (let z = rangeZ[0]; z <= rangeZ[1]; z++) {
    for (let y = rangeY[0]; y <= rangeY[1]; y++) {
      const row = voxelIndex(grid, 0, y, z);
      grid.occupancy.fill(materialId, row + rangeX[0], row + rangeX[1] + 1);
    }
  }
}
