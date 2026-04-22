import { create } from 'zustand';

type BuildingVisibilityState = {
  initialized: boolean;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleObjectIds: Set<string>;
  setVisible: (payload: {
    tileIds: Set<string>;
    wallIds: Set<string>;
    objectIds: Set<string>;
  }) => void;
  reset: () => void;
};

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

const EMPTY = new Set<string>();

export const useBuildingVisibilityStore = create<BuildingVisibilityState>((set) => ({
  initialized: false,
  visibleTileGroupIds: EMPTY,
  visibleWallGroupIds: EMPTY,
  visibleObjectIds: EMPTY,
  setVisible: ({ tileIds, wallIds, objectIds }) =>
    set((state) => {
      const tileChanged = !sameSet(state.visibleTileGroupIds, tileIds);
      const wallChanged = !sameSet(state.visibleWallGroupIds, wallIds);
      const objectChanged = !sameSet(state.visibleObjectIds, objectIds);
      if (!tileChanged && !wallChanged && !objectChanged && state.initialized) {
        return state;
      }
      return {
        initialized: true,
        visibleTileGroupIds: tileChanged ? tileIds : state.visibleTileGroupIds,
        visibleWallGroupIds: wallChanged ? wallIds : state.visibleWallGroupIds,
        visibleObjectIds: objectChanged ? objectIds : state.visibleObjectIds,
      };
    }),
  reset: () =>
    set({
      initialized: false,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleObjectIds: EMPTY,
    }),
}));
