import { create } from 'zustand';

import { getItemRegistry } from '../../items/registry/ItemRegistry';
import type { ItemId } from '../../items/types';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
import { isAmount, isCount, isId, isRecord } from '../../utils/guards';
import {
  DAILY_FRIENDSHIP_CAP,
  FRIENDSHIP_LEVELS,
  type FriendshipEntry,
  type FriendshipLevel,
  type RelationsSerialized,
} from '../types';

type State = {
  entries: Record<string, FriendshipEntry>;

  ensure: (npcId: string) => FriendshipEntry;
  add: (npcId: string, amount: number, gameDay: number) => number;
  giveGift: (npcId: string, itemId: ItemId, gameDay: number) => { gained: number; capped: boolean };
  resetDaily: (npcId?: string) => void;

  scoreOf: (npcId: string) => number;
  levelOf: (npcId: string) => FriendshipLevel;

  serialize: () => RelationsSerialized;
  hydrate: (data: RelationsSerialized | null | undefined) => void;
  prepareHydrate: (data: RelationsSerialized | null | undefined) => () => void;
};

function emptyEntry(npcId: string): FriendshipEntry {
  return { npcId, score: 0, todayGained: 0, lastGiftDay: -1, giftHistory: {} };
}

/** `lastGiftDay` stays -1 until the first gift. */
const isGiftDay = (value: unknown): value is number => value === -1 || isCount(value);

/** What `add`/`giveGift` may leave behind and a relations save may hold. */
function isFriendshipEntry(id: string, entry: unknown): entry is FriendshipEntry {
  return isRecord<FriendshipEntry>(entry) && isId(id) && entry.npcId === id && isAmount(entry.score) && isAmount(entry.todayGained)
    && entry.todayGained <= DAILY_FRIENDSHIP_CAP && isGiftDay(entry.lastGiftDay) && isRecord(entry.giftHistory)
    && Object.entries(entry.giftHistory).every(([itemId, count]) => isId(itemId) && isCount(count));
}

function levelFromScore(score: number): FriendshipLevel {
  let result: FriendshipLevel = 'stranger';
  for (const tier of FRIENDSHIP_LEVELS) {
    if (score >= tier.min) result = tier.level;
  }
  return result;
}

function giftValue(itemId: ItemId): number {
  const def = getItemRegistry().get(itemId);
  if (!def) return 1;
  if (def.rarity === 'legendary') return 25;
  if (def.rarity === 'epic') return 18;
  if (def.rarity === 'rare') return 12;
  if (def.rarity === 'uncommon') return 8;
  if (def.category === 'food') return 6;
  if (def.category === 'fish' || def.category === 'bug') return 7;
  if (def.category === 'furniture') return 10;
  return 4;
}

export function createFriendshipStore() {
  return create<State>((set, get) => ({
  entries: {},

  ensure: (npcId) => {
    const cur = get().entries[npcId];
    if (cur) return cur;
    const next = emptyEntry(npcId);
    if (isId(npcId)) set({ entries: { ...get().entries, [npcId]: next } });
    return next;
  },

  add: (npcId, amount, gameDay) => {
    if (!isId(npcId) || !Number.isFinite(amount) || amount === 0 || !isCount(gameDay)) return 0;
    const cur = get().entries[npcId] ?? emptyEntry(npcId);
    let entry = cur;
    if (entry.lastGiftDay !== gameDay) {
      entry = { ...entry, todayGained: 0, lastGiftDay: gameDay };
    }
    let delta = amount;
    if (delta > 0) {
      const space = Math.max(0, DAILY_FRIENDSHIP_CAP - entry.todayGained);
      delta = Math.min(delta, space);
    }
    if (delta === 0) return 0;
    const nextEntry: FriendshipEntry = {
      ...entry,
      score: Math.max(0, entry.score + delta),
      todayGained: entry.todayGained + Math.max(0, delta),
    };
    set({ entries: { ...get().entries, [npcId]: nextEntry } });
    return delta;
  },

  giveGift: (npcId, itemId, gameDay) => {
    if (!isId(npcId) || !isId(itemId) || !isCount(gameDay)) return { gained: 0, capped: false };
    const value = giftValue(itemId);
    const gained = get().add(npcId, value, gameDay);
    const cur = get().entries[npcId]!;
    const nextHistory = { ...cur.giftHistory, [itemId]: (cur.giftHistory[itemId] ?? 0) + 1 };
    set({ entries: { ...get().entries, [npcId]: { ...cur, giftHistory: nextHistory } } });
    return { gained, capped: gained < value };
  },

  resetDaily: (npcId) => {
    if (npcId) {
      const cur = get().entries[npcId];
      if (!cur) return;
      set({ entries: { ...get().entries, [npcId]: { ...cur, todayGained: 0 } } });
      return;
    }
    const next: Record<string, FriendshipEntry> = {};
    for (const [k, v] of Object.entries(get().entries)) next[k] = { ...v, todayGained: 0 };
    set({ entries: next });
  },

  scoreOf: (npcId) => get().entries[npcId]?.score ?? 0,
  levelOf: (npcId) => levelFromScore(get().scoreOf(npcId)),

  serialize: (): RelationsSerialized => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(get().entries).map(([k, v]) => [k, { ...v, giftHistory: { ...v.giftHistory } }])),
  }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !data.entries ||
      typeof data.entries !== 'object' || Array.isArray(data.entries)) {
      throw new TypeError('Invalid relations snapshot');
    }
    const entries = Object.fromEntries(Object.entries(data.entries).map(([id, entry]) => {
      if (!isFriendshipEntry(id, entry)) throw new TypeError('Invalid friendship entry');
      const { score, todayGained, lastGiftDay, giftHistory } = entry;
      return [id, { npcId: id, score, todayGained, lastGiftDay, giftHistory: { ...giftHistory } }];
    }));
    return () => set({ entries });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));

}

export type FriendshipStore = ReturnType<typeof createFriendshipStore>;
export const RELATIONS_STORE_SERVICE = runtimeStoreServiceKey<FriendshipStore>('relations');
export const { useStore: useFriendshipStore, useStoreApi: useFriendshipStoreApi } = lazyScopedStore(
  'useFriendshipStore', createFriendshipStore, () => useGaesupRuntime()?.friendshipStore,
);
