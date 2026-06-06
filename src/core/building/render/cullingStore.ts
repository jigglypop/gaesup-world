import { create } from 'zustand';

type BuildingGpuCullingState = {
  active: boolean;
  version: number;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleBlockIds: Set<string>;
  visibleObjectIds: Set<string>;
  clusterCounts: Uint32Array;
  setResult: (payload: {
    version: number;
    tileIds: Set<string>;
    wallIds: Set<string>;
    blockIds?: Set<string>;
    objectIds: Set<string>;
    clusterCounts: Uint32Array;
  }) => void;
  reset: () => void;
};

const EMPTY = new Set<string>();

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function sameUint32Array(a: Uint32Array, b: Uint32Array): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

export const useBuildingGpuCullingStore = create<BuildingGpuCullingState>((set) => ({
  active: false,
  version: 0,
  visibleTileGroupIds: EMPTY,
  visibleWallGroupIds: EMPTY,
  visibleBlockIds: EMPTY,
  visibleObjectIds: EMPTY,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version, tileIds, wallIds, blockIds, objectIds, clusterCounts }) =>
    set((state) => {
      const nextBlockIds = blockIds ?? EMPTY;
      if (
        state.active &&
        state.version === version &&
        sameSet(state.visibleTileGroupIds, tileIds) &&
        sameSet(state.visibleWallGroupIds, wallIds) &&
        sameSet(state.visibleBlockIds, nextBlockIds) &&
        sameSet(state.visibleObjectIds, objectIds) &&
        sameUint32Array(state.clusterCounts, clusterCounts)
      ) {
        return state;
      }

      return {
        active: true,
        version,
        visibleTileGroupIds: tileIds,
        visibleWallGroupIds: wallIds,
        visibleBlockIds: nextBlockIds,
        visibleObjectIds: objectIds,
        clusterCounts,
      };
    }),
  reset: () =>
    set({
      active: false,
      version: 0,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleBlockIds: EMPTY,
      visibleObjectIds: EMPTY,
      clusterCounts: new Uint32Array(0),
    }),
}));
