import { create } from 'zustand';

import type { ItemId } from '../../items/types';
import type { CatalogEntry, CatalogSerialized } from '../types';

type State = {
  entries: Record<ItemId, CatalogEntry>;

  record: (itemId: ItemId, count: number, gameDay: number) => void;
  has: (itemId: ItemId) => boolean;
  get: (itemId: ItemId) => CatalogEntry | undefined;
  size: () => number;

  serialize: () => CatalogSerialized;
  hydrate: (data: CatalogSerialized | null | undefined) => void;
};

export const useCatalogStore = create<State>((set, get) => ({
  entries: {},

  record: (itemId, count, gameDay) => {
    if (count <= 0) return;
    const cur = get().entries[itemId];
    const next: CatalogEntry = cur
      ? { ...cur, totalCollected: cur.totalCollected + count }
      : { itemId, firstSeenDay: gameDay, totalCollected: count };
    set({ entries: { ...get().entries, [itemId]: next } });
  },

  has: (itemId) => Boolean(get().entries[itemId]),
  get: (itemId) => get().entries[itemId],
  size: () => Object.keys(get().entries).length,

  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(get().entries).map(([k, v]) => [k, { ...v }])),
  }),

  hydrate: (data) => {
    if (!data || typeof data !== 'object') return;
    const next: Record<ItemId, CatalogEntry> = {};
    if (data.entries && typeof data.entries === 'object') {
      for (const [k, v] of Object.entries(data.entries)) {
        if (!v || typeof v !== 'object') continue;
        next[k] = {
          itemId: k,
          firstSeenDay: typeof v.firstSeenDay === 'number' ? v.firstSeenDay : 0,
          totalCollected: typeof v.totalCollected === 'number' ? v.totalCollected : 0,
        };
      }
    }
    set({ entries: next });
  },
}));
