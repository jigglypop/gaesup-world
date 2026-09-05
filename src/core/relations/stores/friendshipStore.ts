import { create } from 'zustand';

import { getItemRegistry } from '../../items/registry/ItemRegistry';
import type { ItemId } from '../../items/types';
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

export const useFriendshipStore = create<State>((set, get) => ({
  entries: {},

  ensure: (npcId) => {
    const cur = get().entries[npcId];
    if (cur) return cur;
    const next = emptyEntry(npcId);
    set({ entries: { ...get().entries, [npcId]: next } });
    return next;
  },

  add: (npcId, amount, gameDay) => {
    if (amount === 0) return 0;
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
      if (!id.trim() || !entry || typeof entry !== 'object' || entry.npcId !== id ||
        ![entry.score, entry.todayGained].every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
        entry.todayGained > DAILY_FRIENDSHIP_CAP || !Number.isSafeInteger(entry.lastGiftDay) || entry.lastGiftDay < -1 ||
        !entry.giftHistory || typeof entry.giftHistory !== 'object' || Array.isArray(entry.giftHistory)) {
        throw new TypeError('Invalid friendship entry');
      }
      const giftHistory = Object.fromEntries(Object.entries(entry.giftHistory).map(([itemId, count]) => {
        if (!itemId.trim() || !Number.isSafeInteger(count) || count < 0) throw new TypeError('Invalid gift history');
        return [itemId, count];
      }));
      return [id, { npcId: id, score: entry.score, todayGained: entry.todayGained, lastGiftDay: entry.lastGiftDay, giftHistory }];
    }));
    return () => set({ entries });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
