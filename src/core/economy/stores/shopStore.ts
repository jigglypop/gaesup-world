import { create } from 'zustand';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import type { ItemId } from '../../items/types';
import type { ShopOffer, ShopSerialized } from '../types';
import { useWalletStore } from './walletStore';

type ShopState = {
  catalog: ItemId[];
  dailyStock: ShopOffer[];
  lastRolledDay: number;

  setCatalog: (ids: ItemId[]) => void;
  rollDailyStock: (gameDay: number, count?: number) => void;

  buy: (itemId: ItemId, count?: number) => { ok: boolean; reason?: string };
  sell: (itemId: ItemId, count?: number) => { ok: boolean; reason?: string };

  priceOf: (itemId: ItemId) => number;
  sellPriceOf: (itemId: ItemId) => number;

  serialize: () => ShopSerialized;
  hydrate: (data: ShopSerialized | null | undefined) => void;
};

const DEFAULT_CATALOG: ItemId[] = ['axe', 'shovel', 'water-can', 'net', 'rod', 'apple'];

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.slice(0, Math.min(n, a.length));
}

function makeRng(seed: number): () => number {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    const v = (s >>> 0) / 0xffffffff;
    return v;
  };
}

export const useShopStore = create<ShopState>((set, get) => ({
  catalog: DEFAULT_CATALOG,
  dailyStock: [],
  lastRolledDay: -1,

  setCatalog: (ids) => set({ catalog: ids.slice() }),

  rollDailyStock: (gameDay, count = 4) => {
    const s = get();
    if (s.lastRolledDay === gameDay && s.dailyStock.length > 0) return;
    const rng = makeRng(gameDay * 9301 + 49297);
    const picks = pickN(s.catalog, count, rng);
    const offers: ShopOffer[] = picks.map((itemId) => {
      const def = getItemRegistry().get(itemId);
      const stock = def?.stackable ? 5 + Math.floor(rng() * 6) : 1;
      return { itemId, price: def?.buyPrice ?? 100, stock };
    });
    set({ dailyStock: offers, lastRolledDay: gameDay });
  },

  buy: (itemId, count = 1) => {
    if (count <= 0) return { ok: false, reason: 'invalid count' };
    const s = get();
    const offerIdx = s.dailyStock.findIndex((o) => o.itemId === itemId);
    if (offerIdx < 0) return { ok: false, reason: 'not in stock' };
    const offer = s.dailyStock[offerIdx]!;
    const stock = offer.stock ?? 0;
    if (stock < count) return { ok: false, reason: 'insufficient stock' };
    const price = (offer.price ?? get().priceOf(itemId)) * count;
    const wallet = useWalletStore.getState();
    if (wallet.bells < price) return { ok: false, reason: 'insufficient bells' };
    if (!wallet.spend(price)) return { ok: false, reason: 'spend failed' };
    const remaining = useInventoryStore.getState().add(itemId, count);
    if (remaining > 0) {
      wallet.add(price);
      return { ok: false, reason: 'inventory full' };
    }
    const next = s.dailyStock.slice();
    next[offerIdx] = { ...offer, stock: stock - count };
    set({ dailyStock: next });
    return { ok: true };
  },

  sell: (itemId, count = 1) => {
    if (count <= 0) return { ok: false, reason: 'invalid count' };
    const owned = useInventoryStore.getState().countOf(itemId);
    if (owned < count) return { ok: false, reason: 'not enough items' };
    const removed = useInventoryStore.getState().removeById(itemId, count);
    if (removed < count) return { ok: false, reason: 'remove failed' };
    const sellPrice = get().sellPriceOf(itemId) * removed;
    if (sellPrice > 0) useWalletStore.getState().add(sellPrice);
    return { ok: true };
  },

  priceOf: (itemId) => {
    const s = get();
    const offer = s.dailyStock.find((o) => o.itemId === itemId);
    if (offer?.price != null) return offer.price;
    return getItemRegistry().get(itemId)?.buyPrice ?? 0;
  },

  sellPriceOf: (itemId) => getItemRegistry().get(itemId)?.sellPrice ?? 0,

  serialize: (): ShopSerialized => {
    const s = get();
    return {
      version: 1,
      lastRolledDay: s.lastRolledDay,
      dailyStock: s.dailyStock.map((o) => ({ ...o })),
    };
  },

  hydrate: (data) => {
    if (!data) return;
    set({
      lastRolledDay: typeof data.lastRolledDay === 'number' ? data.lastRolledDay : -1,
      dailyStock: Array.isArray(data.dailyStock) ? data.dailyStock.map((o) => ({ ...o })) : [],
    });
  },
}));
