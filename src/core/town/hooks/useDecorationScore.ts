import { useEffect } from 'react';

import { useBuildingStore } from '../../building/stores/buildingStore';
import { useTownStore } from '../stores/townStore';

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
  useEffect(() => {
    if (!enabled) return;
    const w = { ...DEFAULT_WEIGHTS, ...weights };

    const compute = (s: ReturnType<typeof useBuildingStore.getState>) => {
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
      useTownStore.getState().setDecorationScore(score);
    };

    compute(useBuildingStore.getState());
    const off = useBuildingStore.subscribe((s) => compute(s));
    return off;
  }, [enabled, weights.tile, weights.wall, weights.placedObject, weights.base]);
}
