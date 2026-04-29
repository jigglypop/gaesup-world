import { create } from 'zustand';

type BuildingVisibilityState = {
  initialized: boolean;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleBlockIds: Set<string>;
  visibleObjectIds: Set<string>;
  setVisible: (payload: {
    tileIds: Set<string>;
    wallIds: Set<string>;
    blockIds?: Set<string>;
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
  visibleBlockIds: EMPTY,
  visibleObjectIds: EMPTY,
  setVisible: ({ tileIds, wallIds, blockIds, objectIds }) =>
    set((state) => {
      const tileChanged = !sameSet(state.visibleTileGroupIds, tileIds);
      const wallChanged = !sameSet(state.visibleWallGroupIds, wallIds);
      const nextBlockIds = blockIds ?? EMPTY;
      const blockChanged = !sameSet(state.visibleBlockIds, nextBlockIds);
      const objectChanged = !sameSet(state.visibleObjectIds, objectIds);
      if (
        !tileChanged &&
        !wallChanged &&
        !blockChanged &&
        !objectChanged &&
        state.initialized
      ) {
        return state;
      }
      return {
        initialized: true,
        visibleTileGroupIds: tileChanged ? tileIds : state.visibleTileGroupIds,
        visibleWallGroupIds: wallChanged ? wallIds : state.visibleWallGroupIds,
        visibleBlockIds: blockChanged ? nextBlockIds : state.visibleBlockIds,
        visibleObjectIds: objectChanged ? objectIds : state.visibleObjectIds,
      };
    }),
  reset: () =>
    set({
      initialized: false,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleBlockIds: EMPTY,
      visibleObjectIds: EMPTY,
    }),
}));
