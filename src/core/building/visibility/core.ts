import { indexAabb, queryAabbIds, unindexId } from '../model';
import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

export const VISIBILITY_CELL_SIZE = 18;
export const VISIBILITY_MAX_DISTANCE = 140;
/** Resident entities stay mounted until they are this much farther than the entry distance. */
export const VISIBILITY_RESIDENCY_MARGIN = 20;
export const VISIBILITY_UPDATE_INTERVAL = 0.12;
export const VISIBILITY_DIRECTION_BUCKETS = 8;
export const OCCLUDER_MIN_RADIUS = 3.2;
export const OCCLUDER_MIN_WALL_RADIUS = 2.4;
export const OCCLUSION_ALIGNMENT = 0.985;

export type VisibilityRecord = {
  id: string;
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  cellX: number;
  cellZ: number;
};

export type OccluderRecord = VisibilityRecord & {
  key: string;
  kind: 'tile' | 'wall' | 'block';
  strength: number;
};

export type VisibilityKind = 'tile' | 'wall' | 'block' | 'object';

export const VISIBILITY_KINDS: readonly VisibilityKind[] = ['tile', 'wall', 'block', 'object'];

/** Cell hash over record bounds. Records too large for the hash are always candidates. */
export type VisibilityBuckets = {
  cells: Map<number, Set<string>>;
  cellsById: Map<string, number[]>;
  unbounded: Set<string>;
};

export type VisibilityLayer = {
  byId: Map<string, VisibilityRecord>;
  buckets: VisibilityBuckets;
};

export type VisibilityIndex = Record<VisibilityKind, VisibilityLayer> & {
  occluders: { byKey: Map<string, OccluderRecord>; buckets: VisibilityBuckets };
};

function toCellCoord(value: number, cellSize: number): number {
  return Math.floor(value / cellSize);
}

export function createVisibilityQueryKey(
  cameraX: number,
  cameraZ: number,
  forwardX: number,
  forwardZ: number,
  cellSize = VISIBILITY_CELL_SIZE,
  directionBuckets = VISIBILITY_DIRECTION_BUCKETS,
): string {
  const cellX = toCellCoord(cameraX, cellSize);
  const cellZ = toCellCoord(cameraZ, cellSize);
  const angle = Math.atan2(forwardZ, forwardX);
  const normalized = angle < 0 ? angle + Math.PI * 2 : angle;
  const dirBucket = Math.floor((normalized / (Math.PI * 2)) * directionBuckets) % directionBuckets;
  return `${cellX}:${cellZ}:${dirBucket}`;
}

const createBuckets = (): VisibilityBuckets => ({ cells: new Map(), cellsById: new Map(), unbounded: new Set() });
const createLayer = (): VisibilityLayer => ({ byId: new Map(), buckets: createBuckets() });

export function createVisibilityIndex(): VisibilityIndex {
  return {
    tile: createLayer(),
    wall: createLayer(),
    block: createLayer(),
    object: createLayer(),
    occluders: { byKey: new Map(), buckets: createBuckets() },
  };
}

export function indexVisibilityRecord(buckets: VisibilityBuckets, key: string, record: VisibilityRecord): void {
  const { centerX, centerZ, radius } = record;
  try {
    indexAabb(buckets.cells, buckets.cellsById, key, centerX - radius, centerX + radius, centerZ - radius, centerZ + radius, VISIBILITY_CELL_SIZE);
  } catch {
    buckets.unbounded.add(key);
  }
}

export function unindexVisibilityRecord(buckets: VisibilityBuckets, key: string): void {
  unindexId(buckets.cells, buckets.cellsById, key);
  buckets.unbounded.delete(key);
}

function createRecord(
  id: string,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minZ: number,
  maxZ: number,
  cellSize: number,
): VisibilityRecord {
  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;
  const centerZ = (minZ + maxZ) * 0.5;
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;
  return {
    id,
    centerX,
    centerY,
    centerZ,
    radius: Math.max(1, Math.hypot(dx, dy, dz) * 0.5),
    cellX: toCellCoord(centerX, cellSize),
    cellZ: toCellCoord(centerZ, cellSize),
  };
}

export function buildTileGroupRecord(group: TileGroupConfig, cellSize = VISIBILITY_CELL_SIZE): VisibilityRecord | null {
  if (group.tiles.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = 0;
  let maxY = 0.2;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const tile of group.tiles) {
    const size = tile.size ?? 1;
    const half = size * 0.5;
    minX = Math.min(minX, tile.position.x - half);
    maxX = Math.max(maxX, tile.position.x + half);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, Math.max(tile.position.y, 0.2) + 1.5);
    minZ = Math.min(minZ, tile.position.z - half);
    maxZ = Math.max(maxZ, tile.position.z + half);
  }

  return createRecord(group.id, minX, maxX, minY, maxY, minZ, maxZ, cellSize);
}

export function buildWallGroupRecord(group: WallGroupConfig, cellSize = VISIBILITY_CELL_SIZE): VisibilityRecord | null {
  if (group.walls.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = 0;
  let maxY = 2.5;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const wall of group.walls) {
    minX = Math.min(minX, wall.position.x - 1.1);
    maxX = Math.max(maxX, wall.position.x + 1.1);
    minY = Math.min(minY, wall.position.y);
    maxY = Math.max(maxY, wall.position.y + 3.5);
    minZ = Math.min(minZ, wall.position.z - 1.1);
    maxZ = Math.max(maxZ, wall.position.z + 1.1);
  }

  return createRecord(group.id, minX, maxX, minY, maxY, minZ, maxZ, cellSize);
}

export function buildBlockRecord(block: BuildingBlockConfig, cellSize = VISIBILITY_CELL_SIZE): VisibilityRecord {
  const width = Math.max(1, Math.round(block.size?.x ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE;
  const height = Math.max(1, Math.round(block.size?.y ?? 1)) * TILE_CONSTANTS.HEIGHT_STEP;
  const depth = Math.max(1, Math.round(block.size?.z ?? 1)) * TILE_CONSTANTS.GRID_CELL_SIZE;
  const halfCell = TILE_CONSTANTS.GRID_CELL_SIZE * 0.5;
  return createRecord(
    block.id,
    block.position.x - halfCell,
    block.position.x - halfCell + width,
    block.position.y,
    block.position.y + height,
    block.position.z - halfCell,
    block.position.z - halfCell + depth,
    cellSize,
  );
}

function getObjectRadius(object: PlacedObject): number {
  const size = object.config?.size ?? 1;
  switch (object.type) {
    case 'tree':
    case 'sakura':
      return Math.max(2.2, size * 0.8);
    case 'flag':
      return Math.max(1.4, (object.config?.flagWidth ?? 1.5) * 0.8);
    case 'fire':
      return Math.max(1.2, object.config?.fireWidth ?? 1.0);
    case 'billboard':
      return 1.8;
    default:
      return 1.5;
  }
}

export function buildObjectRecord(object: PlacedObject, cellSize = VISIBILITY_CELL_SIZE): VisibilityRecord {
  const radius = getObjectRadius(object);
  return {
    id: object.id,
    centerX: object.position.x,
    centerY: object.position.y + radius * 0.5,
    centerZ: object.position.z,
    radius,
    cellX: toCellCoord(object.position.x, cellSize),
    cellZ: toCellCoord(object.position.z, cellSize),
  };
}

export function collectCandidateIds(
  buckets: VisibilityBuckets,
  cameraX: number,
  cameraZ: number,
  maxDistance = VISIBILITY_MAX_DISTANCE,
): Set<string> {
  if (!Number.isFinite(cameraX) || !Number.isFinite(cameraZ)) return new Set();
  const ids = queryAabbIds(
    buckets.cells,
    cameraX - maxDistance,
    cameraX + maxDistance,
    cameraZ - maxDistance,
    cameraZ + maxDistance,
    VISIBILITY_CELL_SIZE,
  );
  for (const id of buckets.unbounded) ids.add(id);
  return ids;
}

/**
 * Entities within draw distance of the viewer. Membership has hysteresis so orbiting or small moves never
 * remount a group; off-screen culling is left to the renderer's per-object frustum test.
 */
export function collectResidentIds(
  layer: VisibilityLayer,
  x: number,
  y: number,
  z: number,
  previous: ReadonlySet<string>,
): Set<string> {
  const far = VISIBILITY_MAX_DISTANCE + VISIBILITY_RESIDENCY_MARGIN;
  const ids = new Set<string>();
  for (const id of collectCandidateIds(layer.buckets, x, z, far)) {
    const record = layer.byId.get(id);
    if (!record) continue;
    const limit = (previous.has(id) ? far : VISIBILITY_MAX_DISTANCE) + record.radius;
    const dx = record.centerX - x;
    const dy = record.centerY - y;
    const dz = record.centerZ - z;
    if (dx * dx + dy * dy + dz * dz <= limit * limit) ids.add(id);
  }
  return ids;
}

export function collectOccluderCandidates(
  index: VisibilityIndex,
  cameraX: number,
  cameraZ: number,
  maxDistance = VISIBILITY_MAX_DISTANCE,
): OccluderRecord[] {
  const keys = collectCandidateIds(index.occluders.buckets, cameraX, cameraZ, maxDistance);
  const occluders: OccluderRecord[] = [];
  for (const key of keys) {
    const occluder = index.occluders.byKey.get(key);
    if (occluder) occluders.push(occluder);
  }
  return occluders;
}

type VectorLike = { x: number; y: number; z: number };
type OcclusionScratch = {
  targetDir: import('three').Vector3;
  occDir: import('three').Vector3;
  cross: import('three').Vector3;
};

export function isOccludedByAny(
  record: VisibilityRecord,
  selfKind: VisibilityKind,
  camera: VectorLike,
  occluders: OccluderRecord[],
  scratch: OcclusionScratch,
): boolean {
  const tx = record.centerX - camera.x;
  const ty = record.centerY - camera.y;
  const tz = record.centerZ - camera.z;
  const targetDist = Math.sqrt(tx * tx + ty * ty + tz * tz);
  if (targetDist < 10) return false;

  scratch.targetDir.set(tx, ty, tz).normalize();
  for (const occluder of occluders) {
    if (occluder.kind === selfKind && occluder.id === record.id) continue;

    const ox = occluder.centerX - camera.x;
    const oy = occluder.centerY - camera.y;
    const oz = occluder.centerZ - camera.z;
    const occDist = Math.sqrt(ox * ox + oy * oy + oz * oz);
    if (occDist <= 1 || occDist >= targetDist - Math.max(record.radius, 1.2)) continue;

    scratch.occDir.set(ox, oy, oz).normalize();
    const alignment = scratch.targetDir.dot(scratch.occDir);
    if (alignment < OCCLUSION_ALIGNMENT) continue;

    const lateral = scratch.cross.crossVectors(
      scratch.targetDir,
      scratch.occDir,
    ).length() * occDist;
    const cover = occluder.strength + Math.min(record.radius * 0.45, 1.8);
    if (lateral > cover) continue;

    return true;
  }

  return false;
}
