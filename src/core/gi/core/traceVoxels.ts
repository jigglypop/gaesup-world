import type { Vec3 } from '../../grid';
import type { VoxelGrid, VoxelHitScratch, VoxelRayHit } from '../types';
import { isVoxelOccupied } from './voxelGrid';

type Axis = 0 | 1 | 2;
type Triple = [number, number, number];

const AXES: readonly Axis[] = [0, 1, 2];
const PARALLEL_EPSILON = 1e-9;

const rayOrigin: Triple = [0, 0, 0];
const rayDirection: Triple = [0, 0, 0];
const gridLower: Triple = [0, 0, 0];
const cell: Triple = [0, 0, 0];
const step: Triple = [0, 0, 0];
const tMax: Triple = [0, 0, 0];
const tDelta: Triple = [0, 0, 0];
let entryDistance = 0;
let entryAxis: Axis | null = null;

function clipToGrid(grid: VoxelGrid, maxDistance: number): boolean {
  let tNear = 0;
  let tFar = maxDistance;
  let axis: Axis | null = null;
  for (const a of AXES) {
    const lo = gridLower[a];
    const hi = lo + grid.dims[a] * grid.voxelSize;
    const origin = rayOrigin[a];
    const direction = rayDirection[a];
    if (Math.abs(direction) < PARALLEL_EPSILON) {
      if (origin < lo || origin >= hi) return false;
      continue;
    }
    const t1 = (lo - origin) / direction;
    const t2 = (hi - origin) / direction;
    const enter = Math.min(t1, t2);
    const leave = Math.max(t1, t2);
    if (enter > tNear) {
      tNear = enter;
      axis = a;
    }
    tFar = Math.min(tFar, leave);
    if (tNear > tFar) return false;
  }
  entryDistance = tNear;
  entryAxis = axis;
  return true;
}

function nextAxis(): Axis {
  if (tMax[0] <= tMax[1]) return tMax[0] <= tMax[2] ? 0 : 2;
  return tMax[1] <= tMax[2] ? 1 : 2;
}

function writeHit(hit: VoxelHitScratch, distance: number, axis: Axis | null): void {
  hit.distance = distance;
  hit.cellX = cell[0];
  hit.cellY = cell[1];
  hit.cellZ = cell[2];
  if (axis === null) {
    hit.normalX = -rayDirection[0];
    hit.normalY = -rayDirection[1];
    hit.normalZ = -rayDirection[2];
    return;
  }
  hit.normalX = axis === 0 ? -step[0] : 0;
  hit.normalY = axis === 1 ? -step[1] : 0;
  hit.normalZ = axis === 2 ? -step[2] : 0;
}

export function createVoxelHitScratch(): VoxelHitScratch {
  return { distance: 0, cellX: 0, cellY: 0, cellZ: 0, normalX: 0, normalY: 0, normalZ: 0 };
}

/**
 * Amanatides-Woo 3D DDA. 첫 점유 복셀에 진입하는 거리(월드 단위)와 진입 면 법선을 hit에 기록한다.
 * 프레임 루프에서 호출되므로 할당하지 않고 모듈 스크래치를 재사용한다.
 * direction은 정규화되지 않아도 되고, 시작점이 점유 복셀 안이면 거리 0을 기록한다.
 */
export function traceVoxelRayInto(
  grid: VoxelGrid,
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxDistance: number,
  hit: VoxelHitScratch,
): boolean {
  const length = Math.hypot(dx, dy, dz);
  if (!(length > PARALLEL_EPSILON) || !(maxDistance > 0)) return false;
  rayOrigin[0] = ox;
  rayOrigin[1] = oy;
  rayOrigin[2] = oz;
  rayDirection[0] = dx / length;
  rayDirection[1] = dy / length;
  rayDirection[2] = dz / length;
  gridLower[0] = grid.origin.x;
  gridLower[1] = grid.origin.y;
  gridLower[2] = grid.origin.z;
  if (!clipToGrid(grid, maxDistance)) return false;

  const size = grid.voxelSize;
  for (const a of AXES) {
    const direction = rayDirection[a];
    const p = rayOrigin[a] + direction * entryDistance;
    cell[a] = Math.min(grid.dims[a] - 1, Math.max(0, Math.floor((p - gridLower[a]) / size)));
    if (Math.abs(direction) < PARALLEL_EPSILON) {
      step[a] = 0;
      tDelta[a] = Infinity;
      tMax[a] = Infinity;
      continue;
    }
    step[a] = direction > 0 ? 1 : -1;
    tDelta[a] = size / Math.abs(direction);
    const boundary = gridLower[a] + (direction > 0 ? cell[a] + 1 : cell[a]) * size;
    tMax[a] = (boundary - rayOrigin[a]) / direction;
  }

  let t = entryDistance;
  let axis = entryAxis;
  for (;;) {
    if (isVoxelOccupied(grid, cell[0], cell[1], cell[2])) {
      writeHit(hit, t, axis);
      return true;
    }
    const next = nextAxis();
    t = tMax[next];
    if (!(t <= maxDistance)) return false;
    cell[next] += step[next];
    if (cell[next] < 0 || cell[next] >= grid.dims[next]) return false;
    tMax[next] += tDelta[next];
    axis = next;
  }
}

const wrapperScratch = createVoxelHitScratch();

export function traceVoxelRay(
  grid: VoxelGrid,
  origin: Vec3,
  direction: Vec3,
  maxDistance: number,
): VoxelRayHit | null {
  const hit = wrapperScratch;
  if (
    !traceVoxelRayInto(
      grid,
      origin.x,
      origin.y,
      origin.z,
      direction.x,
      direction.y,
      direction.z,
      maxDistance,
      hit,
    )
  ) {
    return null;
  }
  return {
    distance: hit.distance,
    voxel: [hit.cellX, hit.cellY, hit.cellZ],
    normal: { x: hit.normalX, y: hit.normalY, z: hit.normalZ },
  };
}
