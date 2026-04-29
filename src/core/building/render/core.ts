import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../types';
import {
  buildBlockRecord,
  buildObjectRecord,
  buildTileGroupRecord,
  buildWallGroupRecord,
  type OccluderRecord,
  type VisibilityIndex,
  type VisibilityRecord,
  OCCLUDER_MIN_RADIUS,
  OCCLUDER_MIN_WALL_RADIUS,
  VISIBILITY_CELL_SIZE,
} from '../visibility/core';

export const RENDER_KIND_TILE = 0;
export const RENDER_KIND_WALL = 1;
export const RENDER_KIND_OBJECT = 2;
export const RENDER_KIND_BLOCK = 3;

export const RENDER_SUBKIND_TILE_GENERIC = 0;
export const RENDER_SUBKIND_TILE_GRASS = 1;
export const RENDER_SUBKIND_TILE_WATER = 2;
export const RENDER_SUBKIND_TILE_SAND = 3;
export const RENDER_SUBKIND_TILE_SNOWFIELD = 4;
export const RENDER_SUBKIND_WALL_GENERIC = 10;
export const RENDER_SUBKIND_OBJECT_SAKURA = 20;
export const RENDER_SUBKIND_OBJECT_FLAG = 21;
export const RENDER_SUBKIND_OBJECT_FIRE = 22;
export const RENDER_SUBKIND_OBJECT_BILLBOARD = 23;
export const RENDER_SUBKIND_OBJECT_MODEL = 24;
export const RENDER_SUBKIND_BLOCK_GENERIC = 30;

export type BuildingRenderSnapshot = {
  version: number;
  ids: string[];
  kinds: Uint8Array;
  subKinds: Uint8Array;
  centerX: Float32Array;
  centerY: Float32Array;
  centerZ: Float32Array;
  radius: Float32Array;
  cellX: Int16Array;
  cellZ: Int16Array;
  memberCount: Uint16Array;
};

export function createEmptyRenderSnapshot(): BuildingRenderSnapshot {
  return {
    version: 0,
    ids: [],
    kinds: new Uint8Array(0),
    subKinds: new Uint8Array(0),
    centerX: new Float32Array(0),
    centerY: new Float32Array(0),
    centerZ: new Float32Array(0),
    radius: new Float32Array(0),
    cellX: new Int16Array(0),
    cellZ: new Int16Array(0),
    memberCount: new Uint16Array(0),
  };
}

function countEntities(
  wallGroups: WallGroupConfig[],
  tileGroups: TileGroupConfig[],
  objects: PlacedObject[],
  blocks: BuildingBlockConfig[],
): number {
  let count = objects.length + blocks.length;
  for (const group of wallGroups) {
    if (group.walls.length > 0) count += 1;
  }
  for (const group of tileGroups) {
    if (group.tiles.length > 0) count += 1;
  }
  return count;
}

export function buildBuildingRenderSnapshot(args: {
  wallGroups: WallGroupConfig[];
  tileGroups: TileGroupConfig[];
  objects: PlacedObject[];
  blocks?: BuildingBlockConfig[];
  version: number;
}): BuildingRenderSnapshot {
  const blocks = args.blocks ?? [];
  const count = countEntities(args.wallGroups, args.tileGroups, args.objects, blocks);
  if (count === 0) {
    return { ...createEmptyRenderSnapshot(), version: args.version };
  }

  const ids = new Array<string>(count);
  const kinds = new Uint8Array(count);
  const subKinds = new Uint8Array(count);
  const centerX = new Float32Array(count);
  const centerY = new Float32Array(count);
  const centerZ = new Float32Array(count);
  const radius = new Float32Array(count);
  const cellX = new Int16Array(count);
  const cellZ = new Int16Array(count);
  const memberCount = new Uint16Array(count);

  let offset = 0;
  const write = (id: string, kind: number, subKind: number, record: VisibilityRecord, members: number) => {
    ids[offset] = id;
    kinds[offset] = kind;
    subKinds[offset] = subKind;
    centerX[offset] = record.centerX;
    centerY[offset] = record.centerY;
    centerZ[offset] = record.centerZ;
    radius[offset] = record.radius;
    cellX[offset] = record.cellX;
    cellZ[offset] = record.cellZ;
    memberCount[offset] = members;
    offset += 1;
  };

  for (const group of args.tileGroups) {
    const record = buildTileGroupRecord(group);
    if (!record) continue;
    const objectType = group.tiles.find((tile) => tile.objectType && tile.objectType !== 'none')?.objectType ?? 'none';
    const subKind =
      objectType === 'grass' ? RENDER_SUBKIND_TILE_GRASS :
      objectType === 'water' ? RENDER_SUBKIND_TILE_WATER :
      objectType === 'sand' ? RENDER_SUBKIND_TILE_SAND :
      objectType === 'snowfield' ? RENDER_SUBKIND_TILE_SNOWFIELD :
                                RENDER_SUBKIND_TILE_GENERIC;
    write(group.id, RENDER_KIND_TILE, subKind, record, group.tiles.length);
  }

  for (const group of args.wallGroups) {
    const record = buildWallGroupRecord(group);
    if (!record) continue;
    write(group.id, RENDER_KIND_WALL, RENDER_SUBKIND_WALL_GENERIC, record, group.walls.length);
  }

  for (const block of blocks) {
    write(block.id, RENDER_KIND_BLOCK, RENDER_SUBKIND_BLOCK_GENERIC, buildBlockRecord(block), 1);
  }

  for (const object of args.objects) {
    const subKind =
      object.type === 'sakura' ? RENDER_SUBKIND_OBJECT_SAKURA :
      object.type === 'flag' ? RENDER_SUBKIND_OBJECT_FLAG :
      object.type === 'fire' ? RENDER_SUBKIND_OBJECT_FIRE :
      object.type === 'billboard' ? RENDER_SUBKIND_OBJECT_BILLBOARD :
      object.type === 'model' ? RENDER_SUBKIND_OBJECT_MODEL :
                                   RENDER_SUBKIND_OBJECT_FIRE;
    write(object.id, RENDER_KIND_OBJECT, subKind, buildObjectRecord(object), 1);
  }

  return {
    version: args.version,
    ids,
    kinds,
    subKinds,
    centerX,
    centerY,
    centerZ,
    radius,
    cellX,
    cellZ,
    memberCount,
  };
}

function pushBucketCell(map: Map<string, string[]>, cellX: number, cellZ: number, value: string): void {
  const key = `${cellX}:${cellZ}`;
  const existing = map.get(key);
  if (existing) {
    existing.push(value);
    return;
  }
  map.set(key, [value]);
}

function pushBucket(map: Map<string, string[]>, record: VisibilityRecord, value: string): void {
  const radius = Math.max(0, Math.ceil(record.radius / VISIBILITY_CELL_SIZE));
  for (let z = record.cellZ - radius; z <= record.cellZ + radius; z += 1) {
    for (let x = record.cellX - radius; x <= record.cellX + radius; x += 1) {
      pushBucketCell(map, x, z, value);
    }
  }
}

function toRecord(snapshot: BuildingRenderSnapshot, index: number): VisibilityRecord {
  return {
    id: snapshot.ids[index] ?? '',
    centerX: snapshot.centerX[index] ?? 0,
    centerY: snapshot.centerY[index] ?? 0,
    centerZ: snapshot.centerZ[index] ?? 0,
    radius: snapshot.radius[index] ?? 1,
    cellX: snapshot.cellX[index] ?? 0,
    cellZ: snapshot.cellZ[index] ?? 0,
  };
}

export function buildVisibilityIndexFromRenderSnapshot(
  snapshot: BuildingRenderSnapshot,
): VisibilityIndex {
  const index: VisibilityIndex = {
    tileById: new Map(),
    wallById: new Map(),
    blockById: new Map(),
    objectById: new Map(),
    tileBuckets: new Map(),
    wallBuckets: new Map(),
    blockBuckets: new Map(),
    objectBuckets: new Map(),
    occluderByKey: new Map(),
    occluderBuckets: new Map(),
  };

  for (let i = 0; i < snapshot.ids.length; i += 1) {
    const id = snapshot.ids[i];
    if (!id) continue;
    const record = toRecord(snapshot, i);
    const kind = snapshot.kinds[i];

    if (kind === RENDER_KIND_TILE) {
      index.tileById.set(id, record);
      pushBucket(index.tileBuckets, record, id);
      if (record.radius >= OCCLUDER_MIN_RADIUS) {
        const occluder: OccluderRecord = {
          ...record,
          key: `tile:${id}`,
          kind: 'tile',
          strength: record.radius,
        };
        index.occluderByKey.set(occluder.key, occluder);
        pushBucket(index.occluderBuckets, occluder, occluder.key);
      }
      continue;
    }

    if (kind === RENDER_KIND_WALL) {
      index.wallById.set(id, record);
      pushBucket(index.wallBuckets, record, id);
      const members = snapshot.memberCount[i] ?? 0;
      if (record.radius >= OCCLUDER_MIN_WALL_RADIUS || members >= 4) {
        const occluder: OccluderRecord = {
          ...record,
          key: `wall:${id}`,
          kind: 'wall',
          strength: record.radius * 1.15,
        };
        index.occluderByKey.set(occluder.key, occluder);
        pushBucket(index.occluderBuckets, occluder, occluder.key);
      }
      continue;
    }

    if (kind === RENDER_KIND_BLOCK) {
      index.blockById.set(id, record);
      pushBucket(index.blockBuckets, record, id);
      if (record.radius >= OCCLUDER_MIN_WALL_RADIUS || (snapshot.memberCount[i] ?? 0) >= 1) {
        const occluder: OccluderRecord = {
          ...record,
          key: `block:${id}`,
          kind: 'block',
          strength: record.radius * 1.1,
        };
        index.occluderByKey.set(occluder.key, occluder);
        pushBucket(index.occluderBuckets, occluder, occluder.key);
      }
      continue;
    }

    index.objectById.set(id, record);
    pushBucket(index.objectBuckets, record, id);
  }

  return index;
}
