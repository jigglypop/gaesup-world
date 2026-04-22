import {
  RENDER_KIND_OBJECT,
  RENDER_KIND_TILE,
  RENDER_KIND_WALL,
  type BuildingRenderSnapshot,
} from './core';

export type BuildingGpuCullingResult = {
  version: number;
  tileIds: Set<string>;
  wallIds: Set<string>;
  objectIds: Set<string>;
};

export function parseBuildingGpuVisibilityFlags(
  snapshot: BuildingRenderSnapshot,
  flags: Uint32Array,
): BuildingGpuCullingResult {
  const tileIds = new Set<string>();
  const wallIds = new Set<string>();
  const objectIds = new Set<string>();

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
    } else if (kind === RENDER_KIND_OBJECT) {
      objectIds.add(id);
    }
  }

  return {
    version: snapshot.version,
    tileIds,
    wallIds,
    objectIds,
  };
}
