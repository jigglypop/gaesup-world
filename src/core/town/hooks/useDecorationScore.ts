import { useEffect } from 'react';

import { useBuildingStoreApi } from '../../building/stores/buildingStore';
import { useTownStoreApi } from '../stores/townStore';

export type DecorationWeights = {
  tile?: number;
  wall?: number;
  placedObject?: number;
  base?: number;
};

const DEFAULT_WEIGHTS: Required<DecorationWeights> = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0,
};

export function useDecorationScore(enabled: boolean = true, weights: DecorationWeights = {}): void {
  const townStore = useTownStoreApi();
  const buildingStore = useBuildingStoreApi();
  useEffect(() => {
    if (!enabled) return;
    const w = { ...DEFAULT_WEIGHTS, ...weights };

    const compute = (s: ReturnType<typeof buildingStore.getState>) => {
      let tiles = 0;
      let walls = 0;
      const placed = s.objects.length;

      for (const group of s.tileGroups.values()) {
        tiles += group.tiles.length;
      }

      for (const group of s.wallGroups.values()) {
        walls += group.walls.length;
      }

      const score = w.base + tiles * w.tile + walls * w.wall + placed * w.placedObject;
      townStore.getState().setDecorationScore(score);
    };

    compute(buildingStore.getState());
    const off = buildingStore.subscribe((s) => compute(s));
    return off;
  }, [buildingStore, enabled, weights.tile, weights.wall, weights.placedObject, weights.base, townStore]);
}
