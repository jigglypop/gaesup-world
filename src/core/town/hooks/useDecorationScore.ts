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
      let placed = 0;
      const tg = (s as unknown as { tileGroups?: Map<unknown, { tiles?: Map<unknown, unknown> | unknown[] }> }).tileGroups;
      if (tg) {
        for (const g of tg.values()) {
          const t = g?.tiles as Map<unknown, unknown> | unknown[] | undefined;
          if (!t) continue;
          tiles += t instanceof Map ? t.size : t.length;
        }
      }
      const wg = (s as unknown as { wallGroups?: Map<unknown, { walls?: Map<unknown, unknown> | unknown[] }> }).wallGroups;
      if (wg) {
        for (const g of wg.values()) {
          const ws = g?.walls as Map<unknown, unknown> | unknown[] | undefined;
          if (!ws) continue;
          walls += ws instanceof Map ? ws.size : ws.length;
        }
      }
      const po = (s as unknown as { placedObjects?: Map<unknown, unknown> | unknown[] }).placedObjects;
      if (po) placed = po instanceof Map ? po.size : Array.isArray(po) ? po.length : 0;

      const score = w.base + tiles * w.tile + walls * w.wall + placed * w.placedObject;
      useTownStore.getState().setDecorationScore(score);
    };

    compute(useBuildingStore.getState());
    const off = useBuildingStore.subscribe((s) => compute(s));
    return off;
  }, [enabled, weights.tile, weights.wall, weights.placedObject, weights.base]);
}
