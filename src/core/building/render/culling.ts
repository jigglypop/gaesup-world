import {
  RENDER_KIND_OBJECT,
  RENDER_KIND_BLOCK,
  RENDER_KIND_TILE,
  RENDER_KIND_WALL,
  RENDER_SUBKIND_OBJECT_BILLBOARD,
  RENDER_SUBKIND_OBJECT_FIRE,
  RENDER_SUBKIND_OBJECT_FLAG,
  RENDER_SUBKIND_OBJECT_MODEL,
  RENDER_SUBKIND_OBJECT_SAKURA,
  RENDER_SUBKIND_TILE_GRASS,
  RENDER_SUBKIND_TILE_SAND,
  RENDER_SUBKIND_TILE_SNOWFIELD,
  RENDER_SUBKIND_TILE_WATER,
  type BuildingRenderSnapshot,
} from './core';

export const DRAW_CLUSTER_TILE = 0;
export const DRAW_CLUSTER_GRASS = 1;
export const DRAW_CLUSTER_WATER = 2;
export const DRAW_CLUSTER_SAND = 3;
export const DRAW_CLUSTER_SNOWFIELD = 4;
export const DRAW_CLUSTER_WALL = 5;
export const DRAW_CLUSTER_SAKURA = 6;
export const DRAW_CLUSTER_FLAG = 7;
export const DRAW_CLUSTER_FIRE = 8;
export const DRAW_CLUSTER_BILLBOARD = 9;
export const DRAW_CLUSTER_BLOCK = 10;
export const DRAW_CLUSTER_MODEL = 11;
export const DRAW_CLUSTER_COUNT = 12;

export type BuildingGpuCullingResult = {
  version: number;
  tileIds: Set<string>;
  wallIds: Set<string>;
  blockIds: Set<string>;
  objectIds: Set<string>;
  clusterCounts: Uint32Array;
};

export function getDrawClusterForSnapshotEntry(snapshot: BuildingRenderSnapshot, index: number): number {
  const kind = snapshot.kinds[index];
  const subKind = snapshot.subKinds[index];
  if (kind === RENDER_KIND_TILE) {
    if (subKind === RENDER_SUBKIND_TILE_GRASS) return DRAW_CLUSTER_GRASS;
    if (subKind === RENDER_SUBKIND_TILE_WATER) return DRAW_CLUSTER_WATER;
    if (subKind === RENDER_SUBKIND_TILE_SAND) return DRAW_CLUSTER_SAND;
    if (subKind === RENDER_SUBKIND_TILE_SNOWFIELD) return DRAW_CLUSTER_SNOWFIELD;
    return DRAW_CLUSTER_TILE;
  }
  if (kind === RENDER_KIND_WALL) {
    return DRAW_CLUSTER_WALL;
  }
  if (kind === RENDER_KIND_BLOCK) {
    return DRAW_CLUSTER_BLOCK;
  }
  if (kind === RENDER_KIND_OBJECT) {
    if (subKind === RENDER_SUBKIND_OBJECT_SAKURA) return DRAW_CLUSTER_SAKURA;
    if (subKind === RENDER_SUBKIND_OBJECT_FLAG) return DRAW_CLUSTER_FLAG;
    if (subKind === RENDER_SUBKIND_OBJECT_FIRE) return DRAW_CLUSTER_FIRE;
    if (subKind === RENDER_SUBKIND_OBJECT_BILLBOARD) return DRAW_CLUSTER_BILLBOARD;
    if (subKind === RENDER_SUBKIND_OBJECT_MODEL) return DRAW_CLUSTER_MODEL;
  }
  return DRAW_CLUSTER_TILE;
}

export function parseBuildingGpuVisibilityFlags(
  snapshot: BuildingRenderSnapshot,
  flags: Uint32Array,
): BuildingGpuCullingResult {
  const tileIds = new Set<string>();
  const wallIds = new Set<string>();
  const blockIds = new Set<string>();
  const objectIds = new Set<string>();
  const clusterCounts = new Uint32Array(DRAW_CLUSTER_COUNT);

  const count = Math.min(snapshot.ids.length, flags.length);
  for (let i = 0; i < count; i += 1) {
    if ((flags[i] ?? 0) === 0) continue;
    const id = snapshot.ids[i];
    if (!id) continue;
    const kind = snapshot.kinds[i];
    if (kind === RENDER_KIND_TILE) {
      tileIds.add(id);
    } else if (kind === RENDER_KIND_WALL) {
      wallIds.add(id);
    } else if (kind === RENDER_KIND_BLOCK) {
      blockIds.add(id);
    } else if (kind === RENDER_KIND_OBJECT) {
      objectIds.add(id);
    }
    const cluster = getDrawClusterForSnapshotEntry(snapshot, i);
    clusterCounts[cluster] = (clusterCounts[cluster] ?? 0) + 1;
  }

  return {
    version: snapshot.version,
    tileIds,
    wallIds,
    blockIds,
    objectIds,
    clusterCounts,
  };
}
