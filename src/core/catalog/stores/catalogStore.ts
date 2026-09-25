import { create } from 'zustand';

import type { ItemId } from '../../items/types';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
import { isCount, isId, isRecord } from '../../utils/guards';
import type { CatalogEntry, CatalogSerialized } from '../types';

/** What `record` may leave behind and a catalog save may hold. */
function isCatalogEntry(id: string, entry: unknown): entry is CatalogEntry {
  return isRecord<CatalogEntry>(entry) && isId(id) && entry.itemId === id && isCount(entry.firstSeenDay) && isCount(entry.totalCollected);
}

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

export function createCatalogStore() {
  return create<State>((set, get) => ({
  entries: {},

  record: (itemId, count, gameDay) => {
    if (!isId(itemId) || !isCount(count) || count === 0 || !isCount(gameDay)) return;
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
      if (!isCatalogEntry(id, entry)) throw new TypeError('Invalid catalog entry');
      return [id, { itemId: id, firstSeenDay: entry.firstSeenDay, totalCollected: entry.totalCollected }];
    }));
    return () => set({ entries });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
}

export type CatalogStore = ReturnType<typeof createCatalogStore>;
export const CATALOG_STORE_SERVICE = runtimeStoreServiceKey<CatalogStore>('catalog');
export const { useStore: useCatalogStore, useStoreApi: useCatalogStoreApi } = lazyScopedStore(
  'useCatalogStore', createCatalogStore, () => useGaesupRuntime()?.catalogStore,
);
