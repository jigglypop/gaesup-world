import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../types';
import {
  buildBlockRecord,
  buildObjectRecord,
  buildTileGroupRecord,
  buildWallGroupRecord,
  indexVisibilityRecord,
  unindexVisibilityRecord,
  type OccluderRecord,
  type VisibilityIndex,
  type VisibilityKind,
  type VisibilityRecord,
  OCCLUDER_MIN_RADIUS,
  OCCLUDER_MIN_WALL_RADIUS,
  VISIBILITY_KINDS,
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

type RenderEntry = { id: string; kind: number; subKind: number; record: VisibilityRecord; members: number };

export type BuildingRenderSource = {
  wallGroups: Iterable<WallGroupConfig>;
  tileGroups: Iterable<TileGroupConfig>;
  objects: Iterable<PlacedObject>;
  blocks?: Iterable<BuildingBlockConfig>;
};

function tileEntry(group: TileGroupConfig): RenderEntry | null {
  const record = buildTileGroupRecord(group);
  if (!record) return null;
  const objectType = group.tiles.find((tile) => tile.objectType && tile.objectType !== 'none')?.objectType ?? 'none';
  const subKind =
    objectType === 'grass' ? RENDER_SUBKIND_TILE_GRASS :
    objectType === 'water' ? RENDER_SUBKIND_TILE_WATER :
    objectType === 'sand' ? RENDER_SUBKIND_TILE_SAND :
    objectType === 'snowfield' ? RENDER_SUBKIND_TILE_SNOWFIELD :
                              RENDER_SUBKIND_TILE_GENERIC;
  return { id: group.id, kind: RENDER_KIND_TILE, subKind, record, members: group.tiles.length };
}

function wallEntry(group: WallGroupConfig): RenderEntry | null {
  const record = buildWallGroupRecord(group);
  return record && { id: group.id, kind: RENDER_KIND_WALL, subKind: RENDER_SUBKIND_WALL_GENERIC, record, members: group.walls.length };
}

function blockEntry(block: BuildingBlockConfig): RenderEntry {
  return { id: block.id, kind: RENDER_KIND_BLOCK, subKind: RENDER_SUBKIND_BLOCK_GENERIC, record: buildBlockRecord(block), members: 1 };
}

function objectEntry(object: PlacedObject): RenderEntry {
  const subKind =
    object.type === 'tree' || object.type === 'sakura' ? RENDER_SUBKIND_OBJECT_SAKURA :
    object.type === 'flag' ? RENDER_SUBKIND_OBJECT_FLAG :
    object.type === 'fire' ? RENDER_SUBKIND_OBJECT_FIRE :
    object.type === 'billboard' ? RENDER_SUBKIND_OBJECT_BILLBOARD :
    object.type === 'model' ? RENDER_SUBKIND_OBJECT_MODEL :
                                 RENDER_SUBKIND_OBJECT_FIRE;
  return { id: object.id, kind: RENDER_KIND_OBJECT, subKind, record: buildObjectRecord(object), members: 1 };
}

function packSnapshot(entries: RenderEntry[], version: number): BuildingRenderSnapshot {
  const count = entries.length;
  const snapshot: BuildingRenderSnapshot = {
    version,
    ids: new Array<string>(count),
    kinds: new Uint8Array(count),
    subKinds: new Uint8Array(count),
    centerX: new Float32Array(count),
    centerY: new Float32Array(count),
    centerZ: new Float32Array(count),
    radius: new Float32Array(count),
    cellX: new Int16Array(count),
    cellZ: new Int16Array(count),
    memberCount: new Uint16Array(count),
  };
  for (let i = 0; i < count; i += 1) {
    const { id, kind, subKind, record, members } = entries[i]!;
    snapshot.ids[i] = id;
    snapshot.kinds[i] = kind;
    snapshot.subKinds[i] = subKind;
    snapshot.centerX[i] = record.centerX;
    snapshot.centerY[i] = record.centerY;
    snapshot.centerZ[i] = record.centerZ;
    snapshot.radius[i] = record.radius;
    snapshot.cellX[i] = record.cellX;
    snapshot.cellZ[i] = record.cellZ;
    snapshot.memberCount[i] = members;
  }
  return snapshot;
}

/**
 * Snapshot builder that caches each entity's record by config identity. Store edits share unchanged groups
 * structurally, so an edit recomputes only the touched group instead of scanning every tile in the world.
 * Configs must be treated as immutable while the builder is alive.
 */
export function createBuildingRenderSnapshotBuilder(): (source: BuildingRenderSource, version: number) => BuildingRenderSnapshot {
  const cache = new WeakMap<object, RenderEntry | null>();
  const collect = <T extends object>(values: Iterable<T>, build: (value: T) => RenderEntry | null, out: RenderEntry[]) => {
    for (const value of values) {
      let entry = cache.get(value);
      if (entry === undefined) {
        entry = build(value);
        cache.set(value, entry);
      }
      if (entry) out.push(entry);
    }
  };
  return (source, version) => {
    const entries: RenderEntry[] = [];
    collect(source.tileGroups, tileEntry, entries);
    collect(source.wallGroups, wallEntry, entries);
    collect(source.blocks ?? [], blockEntry, entries);
    collect(source.objects, objectEntry, entries);
    return packSnapshot(entries, version);
  };
}

export function buildBuildingRenderSnapshot(args: BuildingRenderSource & { version: number }): BuildingRenderSnapshot {
  return createBuildingRenderSnapshotBuilder()(args, args.version);
}

/** Indexed by `RENDER_KIND_*`. */
const KIND_OF_RENDER: readonly VisibilityKind[] = ['tile', 'wall', 'object', 'block'];

type IndexedRecord = VisibilityRecord & { members: number };

function occluderStrength(kind: VisibilityKind, radius: number, members: number): number {
  if (kind === 'tile') return radius >= OCCLUDER_MIN_RADIUS ? radius : 0;
  if (kind === 'wall') return radius >= OCCLUDER_MIN_WALL_RADIUS || members >= 4 ? radius * 1.15 : 0;
  return kind === 'block' ? radius * 1.1 : 0;
}

function matches(record: IndexedRecord, snapshot: BuildingRenderSnapshot, i: number): boolean {
  return record.centerX === snapshot.centerX[i] && record.centerY === snapshot.centerY[i] &&
    record.centerZ === snapshot.centerZ[i] && record.radius === snapshot.radius[i] &&
    record.cellX === snapshot.cellX[i] && record.cellZ === snapshot.cellZ[i] &&
    record.members === snapshot.memberCount[i];
}

function unindexEntry(index: VisibilityIndex, kind: VisibilityKind, id: string): void {
  const layer = index[kind];
  layer.byId.delete(id);
  unindexVisibilityRecord(layer.buckets, id);
  const key = `${kind}:${id}`;
  if (index.occluders.byKey.delete(key)) unindexVisibilityRecord(index.occluders.buckets, key);
}

/**
 * Brings the index in line with a render snapshot. Entities whose snapshot values did not change keep their
 * cells, so an edit re-buckets only the touched groups.
 */
export function syncVisibilityIndex(index: VisibilityIndex, snapshot: BuildingRenderSnapshot): void {
  const live = new Set<VisibilityRecord>();
  for (let i = 0; i < snapshot.ids.length; i += 1) {
    const id = snapshot.ids[i];
    const kind = KIND_OF_RENDER[snapshot.kinds[i] ?? -1];
    if (!id || !kind) continue;
    const layer = index[kind];
    const previous = layer.byId.get(id) as IndexedRecord | undefined;
    if (previous && matches(previous, snapshot, i)) {
      live.add(previous);
      continue;
    }
    if (previous) unindexEntry(index, kind, id);
    const record: IndexedRecord = {
      id,
      centerX: snapshot.centerX[i]!,
      centerY: snapshot.centerY[i]!,
      centerZ: snapshot.centerZ[i]!,
      radius: snapshot.radius[i]!,
      cellX: snapshot.cellX[i]!,
      cellZ: snapshot.cellZ[i]!,
      members: snapshot.memberCount[i]!,
    };
    layer.byId.set(id, record);
    indexVisibilityRecord(layer.buckets, id, record);
    live.add(record);
    const strength = occluderStrength(kind, record.radius, record.members);
    if (strength > 0) {
      const occluder: OccluderRecord = { ...record, key: `${kind}:${id}`, kind: kind as OccluderRecord['kind'], strength };
      index.occluders.byKey.set(occluder.key, occluder);
      indexVisibilityRecord(index.occluders.buckets, occluder.key, occluder);
    }
  }
  for (const kind of VISIBILITY_KINDS) {
    for (const [id, record] of index[kind].byId) {
      if (!live.has(record)) unindexEntry(index, kind, id);
    }
  }
}
