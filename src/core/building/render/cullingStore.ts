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

export const useBuildingGpuCullingStore = create<BuildingGpuCullingState>((set) => ({
  active: false,
  version: 0,
  visibleTileGroupIds: EMPTY,
  visibleWallGroupIds: EMPTY,
  visibleBlockIds: EMPTY,
  visibleObjectIds: EMPTY,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version, tileIds, wallIds, blockIds, objectIds, clusterCounts }) =>
    set({
      active: true,
      version,
      visibleTileGroupIds: tileIds,
      visibleWallGroupIds: wallIds,
      visibleBlockIds: blockIds ?? EMPTY,
      visibleObjectIds: objectIds,
      clusterCounts,
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
