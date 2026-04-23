import type { PlacedObject, TileGroupConfig, WallGroupConfig } from '../types';

export const VISIBILITY_CELL_SIZE = 18;
export const VISIBILITY_MAX_DISTANCE = 140;
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
  kind: 'tile' | 'wall';
  strength: number;
};

export type VisibilityIndex = {
  tileById: Map<string, VisibilityRecord>;
  wallById: Map<string, VisibilityRecord>;
  objectById: Map<string, VisibilityRecord>;
  tileBuckets: Map<string, string[]>;
  wallBuckets: Map<string, string[]>;
  objectBuckets: Map<string, string[]>;
  occluderByKey: Map<string, OccluderRecord>;
  occluderBuckets: Map<string, string[]>;
};

function toCellCoord(value: number, cellSize: number): number {
  return Math.floor(value / cellSize);
}

function cellKey(cellX: number, cellZ: number): string {
  return `${cellX}:${cellZ}`;
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

function pushBucket(map: Map<string, string[]>, record: VisibilityRecord): void {
  const key = cellKey(record.cellX, record.cellZ);
  const existing = map.get(key);
  if (existing) {
    existing.push(record.id);
    return;
  }
  map.set(key, [record.id]);
}

function pushRawBucket(map: Map<string, string[]>, cellX: number, cellZ: number, value: string): void {
  const key = cellKey(cellX, cellZ);
  const existing = map.get(key);
  if (existing) {
    existing.push(value);
    return;
  }
  map.set(key, [value]);
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

function getObjectRadius(object: PlacedObject): number {
  const size = object.config?.size ?? 1;
  switch (object.type) {
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

export function buildVisibilityIndex(
  wallGroups: WallGroupConfig[],
  tileGroups: TileGroupConfig[],
  objects: PlacedObject[],
  cellSize = VISIBILITY_CELL_SIZE,
): VisibilityIndex {
  const index: VisibilityIndex = {
    tileById: new Map(),
    wallById: new Map(),
    objectById: new Map(),
    tileBuckets: new Map(),
    wallBuckets: new Map(),
    objectBuckets: new Map(),
    occluderByKey: new Map(),
    occluderBuckets: new Map(),
  };

  for (const group of tileGroups) {
    const record = buildTileGroupRecord(group, cellSize);
    if (!record) continue;
    index.tileById.set(record.id, record);
    pushBucket(index.tileBuckets, record);
    if (record.radius >= OCCLUDER_MIN_RADIUS) {
      const occluder: OccluderRecord = {
        ...record,
        key: `tile:${record.id}`,
        kind: 'tile',
        strength: record.radius,
      };
      index.occluderByKey.set(occluder.key, occluder);
      pushRawBucket(index.occluderBuckets, occluder.cellX, occluder.cellZ, occluder.key);
    }
  }

  for (const group of wallGroups) {
    const record = buildWallGroupRecord(group, cellSize);
    if (!record) continue;
    index.wallById.set(record.id, record);
    pushBucket(index.wallBuckets, record);
    if (record.radius >= OCCLUDER_MIN_WALL_RADIUS || group.walls.length >= 4) {
      const occluder: OccluderRecord = {
        ...record,
        key: `wall:${record.id}`,
        kind: 'wall',
        strength: record.radius * 1.15,
      };
      index.occluderByKey.set(occluder.key, occluder);
      pushRawBucket(index.occluderBuckets, occluder.cellX, occluder.cellZ, occluder.key);
    }
  }

  for (const object of objects) {
    const record = buildObjectRecord(object, cellSize);
    index.objectById.set(record.id, record);
    pushBucket(index.objectBuckets, record);
  }

  return index;
}

export function collectCandidateIds(
  buckets: Map<string, string[]>,
  cameraX: number,
  cameraZ: number,
  maxDistance = VISIBILITY_MAX_DISTANCE,
  cellSize = VISIBILITY_CELL_SIZE,
): Set<string> {
  const cx = toCellCoord(cameraX, cellSize);
  const cz = toCellCoord(cameraZ, cellSize);
  const cellRadius = Math.ceil(maxDistance / cellSize);
  const ids = new Set<string>();

  for (let z = cz - cellRadius; z <= cz + cellRadius; z += 1) {
    for (let x = cx - cellRadius; x <= cx + cellRadius; x += 1) {
      const bucket = buckets.get(cellKey(x, z));
      if (!bucket) continue;
      for (const id of bucket) ids.add(id);
    }
  }

  return ids;
}

export function collectOccluderCandidates(
  index: VisibilityIndex,
  cameraX: number,
  cameraZ: number,
  maxDistance = VISIBILITY_MAX_DISTANCE,
  cellSize = VISIBILITY_CELL_SIZE,
): OccluderRecord[] {
  const keys = collectCandidateIds(index.occluderBuckets, cameraX, cameraZ, maxDistance, cellSize);
  const occluders: OccluderRecord[] = [];
  for (const key of keys) {
    const occluder = index.occluderByKey.get(key);
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
  selfKind: 'tile' | 'wall' | 'object',
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
