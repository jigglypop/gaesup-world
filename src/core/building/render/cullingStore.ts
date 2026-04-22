import { create } from 'zustand';

type BuildingGpuCullingState = {
  active: boolean;
  version: number;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleObjectIds: Set<string>;
  setResult: (payload: {
    version: number;
    tileIds: Set<string>;
    wallIds: Set<string>;
    objectIds: Set<string>;
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
  setResult: ({ version, tileIds, wallIds, objectIds }) =>
    set({
      active: true,
      version,
      visibleTileGroupIds: tileIds,
      visibleWallGroupIds: wallIds,
      visibleObjectIds: objectIds,
    }),
  reset: () =>
    set({
      active: false,
      version: 0,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleObjectIds: EMPTY,
    }),
}));
