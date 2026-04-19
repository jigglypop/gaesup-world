import { create } from 'zustand';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { notify } from '../../ui/components/Toast/toastStore';
import { getCropRegistry } from '../registry/CropRegistry';
import type { CropId, FarmingSerialized, Plot, PlotState } from '../types';

type State = {
  plots: Record<string, Plot>;

  registerPlot: (plot: Pick<Plot, 'id' | 'position'> & Partial<Omit<Plot, 'id' | 'position'>>) => void;
  unregisterPlot: (id: string) => void;

  till: (id: string) => boolean;
  plant: (id: string, cropId: CropId, currentMinutes: number) => boolean;
  water: (id: string, currentMinutes: number) => boolean;
  harvest: (id: string) => boolean;

  tick: (currentMinutes: number) => void;

  near: (x: number, z: number, radius: number) => Plot | null;

  serialize: () => FarmingSerialized;
  hydrate: (data: FarmingSerialized | null | undefined) => void;
};

function emptyPlot(id: string, position: [number, number, number]): Plot {
  return { id, position, state: 'empty', stageIndex: 0 };
}

function effectiveStageIndex(plot: Plot, currentMinutes: number): number {
  if (plot.state !== 'planted' && plot.state !== 'mature') return plot.stageIndex;
  const def = plot.cropId ? getCropRegistry().get(plot.cropId) : undefined;
  if (!def || plot.plantedAt === undefined) return plot.stageIndex;
  let elapsed = currentMinutes - plot.plantedAt;
  for (let i = 0; i < def.stages.length; i++) {
    const s = def.stages[i]!;
    if (s.durationMinutes <= 0) return i;
    if (elapsed < s.durationMinutes) return i;
    elapsed -= s.durationMinutes;
  }
  return def.stages.length - 1;
}

export const usePlotStore = create<State>((set, get) => ({
  plots: {},

  registerPlot: (input) => {
    const cur = get().plots[input.id];
    if (cur) return;
    const next: Plot = { ...emptyPlot(input.id, input.position), ...input };
    set({ plots: { ...get().plots, [input.id]: next } });
  },

  unregisterPlot: (id) => {
    if (!get().plots[id]) return;
    const next = { ...get().plots };
    delete next[id];
    set({ plots: next });
  },

  till: (id) => {
    const cur = get().plots[id];
    if (!cur) return false;
    if (cur.state !== 'empty') return false;
    set({ plots: { ...get().plots, [id]: { ...cur, state: 'tilled', stageIndex: 0 } } });
    return true;
  },

  plant: (id, cropId, currentMinutes) => {
    const cur = get().plots[id];
    const def = getCropRegistry().get(cropId);
    if (!cur || !def) return false;
    if (cur.state !== 'tilled') return false;
    const inv = useInventoryStore.getState();
    if (inv.countOf(def.seedItemId) < 1) {
      notify('warn', `${def.name} 씨앗 부족`);
      return false;
    }
    inv.removeById(def.seedItemId, 1);
    set({
      plots: {
        ...get().plots,
        [id]: {
          ...cur,
          state: 'planted',
          cropId,
          plantedAt: currentMinutes,
          lastWateredAt: currentMinutes,
          stageIndex: 0,
        },
      },
    });
    notify('success', `${def.name} 심음`);
    return true;
  },

  water: (id, currentMinutes) => {
    const cur = get().plots[id];
    if (!cur) return false;
    if (cur.state !== 'planted' && cur.state !== 'dried') return false;
    let next: Plot = { ...cur, lastWateredAt: currentMinutes };
    if (cur.state === 'dried') next = { ...next, state: 'planted' };
    set({ plots: { ...get().plots, [id]: next } });
    return true;
  },

  harvest: (id) => {
    const cur = get().plots[id];
    if (!cur || cur.state !== 'mature' || !cur.cropId) return false;
    const def = getCropRegistry().get(cur.cropId);
    if (!def) return false;
    const left = useInventoryStore.getState().add(def.yieldItemId, def.yieldCount);
    if (left > 0) {
      notify('warn', '인벤토리가 가득 찼습니다');
      return false;
    }
    notify('reward', `${def.name} +${def.yieldCount}`);
    set({
      plots: {
        ...get().plots,
        [id]: {
          ...emptyPlot(cur.id, cur.position),
          state: 'tilled',
        },
      },
    });
    return true;
  },

  tick: (currentMinutes) => {
    const cur = get().plots;
    const next: Record<string, Plot> = {};
    let changed = false;
    for (const [id, plot] of Object.entries(cur)) {
      let p = plot;
      if (p.state === 'planted' || p.state === 'mature') {
        const def = p.cropId ? getCropRegistry().get(p.cropId) : undefined;
        if (def && p.plantedAt !== undefined) {
          const last = p.lastWateredAt ?? p.plantedAt;
          if (currentMinutes - last >= def.driedOutMinutes && p.state !== 'dried') {
            p = { ...p, state: 'dried' };
            changed = true;
          } else {
            const idx = effectiveStageIndex(p, currentMinutes);
            const matureIdx = def.stages.length - 1;
            const newState: PlotState = idx >= matureIdx ? 'mature' : 'planted';
            if (idx !== p.stageIndex || newState !== p.state) {
              p = { ...p, stageIndex: idx, state: newState };
              changed = true;
            }
          }
        }
      }
      next[id] = p;
    }
    if (changed) set({ plots: next });
  },

  near: (x, z, radius) => {
    const r2 = radius * radius;
    let best: Plot | null = null;
    let bestD = Infinity;
    for (const p of Object.values(get().plots)) {
      const dx = p.position[0] - x;
      const dz = p.position[2] - z;
      const d = dx * dx + dz * dz;
      if (d < r2 && d < bestD) { bestD = d; best = p; }
    }
    return best;
  },

  serialize: () => ({ version: 1, plots: Object.values(get().plots).map((p) => ({ ...p })) }),

  hydrate: (data) => {
    if (!data || !Array.isArray(data.plots)) return;
    const next: Record<string, Plot> = {};
    for (const p of data.plots) if (p?.id) next[p.id] = { ...p };
    set({ plots: next });
  },
}));
