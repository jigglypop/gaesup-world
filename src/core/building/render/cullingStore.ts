import { create } from 'zustand';

type BuildingGpuCullingState = {
  active: boolean;
  version: number;
  camera: {
    viewProjection: readonly number[];
    position: readonly number[];
    coordinateSystem: number;
    reversedDepth: boolean;
  } | null;
  visibleTileGroupIds: Set<string>;
  visibleWallGroupIds: Set<string>;
  visibleBlockIds: Set<string>;
  visibleObjectIds: Set<string>;
  clusterCounts: Uint32Array;
  setResult: (payload: {
    version: number;
    camera?: BuildingGpuCullingState['camera'];
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
  camera: null,
  visibleTileGroupIds: EMPTY,
  visibleWallGroupIds: EMPTY,
  visibleBlockIds: EMPTY,
  visibleObjectIds: EMPTY,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version, camera = null, tileIds, wallIds, blockIds, objectIds, clusterCounts }) =>
    set((state) => {
      const nextBlockIds = blockIds ?? EMPTY;
      if (
        state.active &&
        state.version === version &&
        (state.camera === camera || (state.camera !== null && camera !== null &&
          state.camera.coordinateSystem === camera.coordinateSystem &&
          state.camera.reversedDepth === camera.reversedDepth &&
          state.camera.viewProjection.length === camera.viewProjection.length &&
          state.camera.position.length === camera.position.length &&
          state.camera.viewProjection.every((value, index) => value === camera.viewProjection[index]) &&
          state.camera.position.every((value, index) => value === camera.position[index]))) &&
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
        camera,
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
      camera: null,
      visibleTileGroupIds: EMPTY,
      visibleWallGroupIds: EMPTY,
      visibleBlockIds: EMPTY,
      visibleObjectIds: EMPTY,
      clusterCounts: new Uint32Array(0),
    }),
}));
