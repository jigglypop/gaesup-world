import { create } from 'zustand';

type BuildingGpuCullingState = {
  active: boolean;
  version: number;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleObjectIds: Set<string>;
  clusterCounts: Uint32Array;
  setResult: (payload: {
    version: number;
    tileIds: Set<string>;
    wallIds: Set<string>;
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
  visibleObjectIds: EMPTY,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version, tileIds, wallIds, objectIds, clusterCounts }) =>
    set({
      active: true,
      version,
      visibleTileGroupIds: tileIds,
      visibleWallGroupIds: wallIds,
      visibleObjectIds: objectIds,
      clusterCounts,
    }),
  reset: () =>
    set({
      active: false,
      version: 0,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleObjectIds: EMPTY,
      clusterCounts: new Uint32Array(0),
    }),
}));
