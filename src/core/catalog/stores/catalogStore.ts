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
  prepareHydrate: (data: CatalogSerialized | null | undefined) => () => void;
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

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !data.entries ||
      typeof data.entries !== 'object' || Array.isArray(data.entries)) {
      throw new TypeError('Invalid catalog snapshot');
    }
    const entries = Object.fromEntries(Object.entries(data.entries).map(([id, entry]) => {
      if (!id.trim() || !entry || typeof entry !== 'object' || entry.itemId !== id ||
        !Number.isSafeInteger(entry.firstSeenDay) || entry.firstSeenDay < 0 ||
        !Number.isSafeInteger(entry.totalCollected) || entry.totalCollected < 0) {
        throw new TypeError('Invalid catalog entry');
      }
      return [id, { itemId: id, firstSeenDay: entry.firstSeenDay, totalCollected: entry.totalCollected }];
    }));
    return () => set({ entries });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
