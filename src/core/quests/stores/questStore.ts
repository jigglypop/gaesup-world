import { create } from 'zustand';

import { useWalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { useTimeStore } from '../../time/stores/timeStore';
import { notify } from '../../ui/components/Toast/toastStore';
import { getObjectiveCount } from '../core/objectiveProgress';
import { getQuestRegistry } from '../registry/QuestRegistry';
import type {
  ObjectiveId,
  QuestDef,
  QuestId,
  QuestObjective,
  QuestProgress,
  QuestReward,
  QuestSerialized,
  QuestStatus,
} from '../types';

type State = {
  state: Record<QuestId, QuestProgress>;

  start: (id: QuestId) => boolean;
  abandon: (id: QuestId) => void;
  complete: (id: QuestId) => boolean;

  notifyTalk: (npcId: string) => void;
  notifyDeliver: (npcId: string, itemId: string, count?: number) => boolean;
  notifyVisit: (tag: string) => void;
  notifyFlag: (key: string, value: string | number | boolean) => void;

  recheck: (id: QuestId) => void;

  statusOf: (id: QuestId) => QuestStatus;
  progressOf: (id: QuestId) => QuestProgress | null;
  active: () => QuestProgress[];
  completed: () => QuestProgress[];
  isObjectiveComplete: (def: QuestDef, p: QuestProgress, obj: QuestObjective) => boolean;
  isAllObjectivesComplete: (id: QuestId) => boolean;

  serialize: () => QuestSerialized;
  hydrate: (data: QuestSerialized | null | undefined) => void;
  prepareHydrate: (data: QuestSerialized | null | undefined) => () => void;
};

function objectiveTarget(obj: QuestObjective): number {
  if (obj.type === 'collect' || obj.type === 'deliver') return obj.count;
  return 1;
}

function canReceiveRewards(rewards: QuestReward[]): boolean {
  const slots = useInventoryStore.getState().slots;
  let empty = slots.filter((slot) => slot === null).length;
  const counts = new Map<string, number>();
  for (const reward of rewards) {
    if (reward.type === 'item') {
      counts.set(reward.itemId, (counts.get(reward.itemId) ?? 0) + (reward.count ?? 1));
    }
  }
  for (const [itemId, count] of counts) {
    const def = getItemRegistry().get(itemId);
    const maxStack = def?.stackable ? Math.max(1, def.maxStack) : 1;
    let remaining = count;
    for (const slot of slots) {
      if (slot?.itemId === itemId) remaining -= Math.max(0, maxStack - slot.count);
    }
    empty -= Math.ceil(Math.max(0, remaining) / maxStack);
    if (empty < 0) return false;
  }
  return true;
}

function applyReward(reward: QuestReward) {
  if (reward.type === 'item') {
    const left = useInventoryStore.getState().add(reward.itemId, reward.count ?? 1);
    if (left > 0) notify('warn', '인벤토리가 부족합니다');
  } else if (reward.type === 'bells') {
    useWalletStore.getState().add(reward.amount);
    notify('reward', `+${reward.amount} B`);
  } else if (reward.type === 'friendship') {
    const day = Math.floor(useTimeStore.getState().totalMinutes / (60 * 24));
    useFriendshipStore.getState().add(reward.npcId, reward.amount, day);
  }
}

function makeProgress(def: QuestDef, status: QuestStatus = 'active'): QuestProgress {
  const progress: Record<ObjectiveId, number> = {};
  for (const o of def.objectives) progress[o.id] = 0;
  return { questId: def.id, status, progress, startedAt: Date.now() };
}

function advanceObjectives(state: State['state'], matches: (objective: QuestObjective) => boolean): State['state'] {
  let next = state;
  for (const [id, progress] of Object.entries(state)) {
    if (progress.status !== 'active') continue;
    const def = getQuestRegistry().get(id);
    if (!def) continue;
    let updated = progress;
    for (const objective of def.objectives) {
      if ((updated.progress[objective.id] ?? 0) >= 1 || !matches(objective)) continue;
      if (updated === progress) updated = { ...progress, progress: { ...progress.progress } };
      updated.progress[objective.id] = 1;
    }
    if (updated === progress) continue;
    if (next === state) next = { ...state };
    next[id] = updated;
  }
  return next;
}

const PENDING_COMPLETIONS = new Set<string>();

export const useQuestStore = create<State>((set, get) => ({
  state: {},

  start: (id) => {
    const def = getQuestRegistry().get(id);
    if (!def) return false;
    const cur = get().state[id];
    if (cur && cur.status === 'active') return false;
    if (cur && cur.status === 'completed' && !def.repeatable) return false;
    if (def.prerequisiteQuests) {
      for (const pre of def.prerequisiteQuests) {
        if (get().state[pre]?.status !== 'completed') return false;
      }
    }
    const next = makeProgress(def, 'active');
    set({ state: { ...get().state, [id]: next } });
    notify('info', `퀘스트 시작: ${def.name}`);
    return true;
  },

  abandon: (id) => {
    const cur = get().state[id];
    if (!cur || cur.status !== 'active') return;
    set({ state: { ...get().state, [id]: { ...cur, status: 'failed' } } });
  },

  complete: (id) => {
    if (PENDING_COMPLETIONS.has(id)) return false;
    PENDING_COMPLETIONS.add(id);
    try {
      const def = getQuestRegistry().get(id);
      if (!def) return false;
      const cur = get().state[id];
      if (!cur || cur.status !== 'active') return false;
      if (!get().isAllObjectivesComplete(id)) return false;
      if (!canReceiveRewards(def.rewards)) {
        notify('warn', '보상을 받을 가방 공간이 부족해요. 공간을 비운 뒤 다시 완료해 주세요.');
        return false;
      }
      for (const r of def.rewards) applyReward(r);
      set({ state: { ...get().state, [id]: { ...cur, status: 'completed', completedAt: Date.now() } } });
      notify('success', `퀘스트 완료: ${def.name}`);
      return true;
    } finally {
      PENDING_COMPLETIONS.delete(id);
    }
  },

  notifyTalk: (npcId) => {
    const state = get().state;
    const next = advanceObjectives(state, (o) => o.type === 'talk' && o.npcId === npcId);
    if (next !== state) set({ state: next });
  },

  notifyDeliver: (npcId, itemId, count = 1) => {
    if (!Number.isSafeInteger(count) || count <= 0) return false;
    let remaining = count;
    let success = false;
    const next = { ...get().state };
    for (const [qid, prog] of Object.entries(next)) {
      if (prog.status !== 'active') continue;
      const def = getQuestRegistry().get(qid);
      if (!def) continue;
      for (const o of def.objectives) {
        if (o.type === 'deliver' && o.npcId === npcId && o.itemId === itemId) {
          const have = useInventoryStore.getState().countOf(itemId);
          if (have <= 0) continue;
          const current = next[qid] ?? prog;
          const taken = Math.min(have, o.count - (current.progress[o.id] ?? 0), remaining);
          if (taken <= 0) continue;
          const removed = useInventoryStore.getState().removeById(itemId, taken);
          remaining -= removed;
          next[qid] = {
            ...current,
            progress: { ...current.progress, [o.id]: (current.progress[o.id] ?? 0) + removed },
          };
          success = true;
        }
      }
    }
    if (success) set({ state: next });
    return success;
  },

  notifyVisit: (tag) => {
    const state = get().state;
    const next = advanceObjectives(state, (o) => o.type === 'visit' && o.tag === tag);
    if (next !== state) set({ state: next });
  },

  notifyFlag: (key, value) => {
    const state = get().state;
    const next = advanceObjectives(state, (o) => o.type === 'flag' && o.key === key && o.value === value);
    if (next !== state) set({ state: next });
  },

  recheck: (id) => {
    const def = getQuestRegistry().get(id);
    const prog = get().state[id];
    if (!def || !prog || prog.status !== 'active') return;
    let next = prog;
    for (const o of def.objectives) {
      if (o.type === 'collect') {
        const count = getObjectiveCount(def, prog, o, useInventoryStore.getState().countOf(o.itemId));
        if (count !== (next.progress[o.id] ?? 0)) {
          next = { ...next, progress: { ...next.progress, [o.id]: count } };
        }
      }
    }
    if (next !== prog) set({ state: { ...get().state, [id]: next } });
  },

  statusOf: (id) => get().state[id]?.status ?? 'available',
  progressOf: (id) => get().state[id] ?? null,
  active: () => Object.values(get().state).filter((p) => p.status === 'active'),
  completed: () => Object.values(get().state).filter((p) => p.status === 'completed'),

  isObjectiveComplete: (def, p, obj) => {
    const cur = getObjectiveCount(def, p, obj, obj.type === 'collect'
      ? useInventoryStore.getState().countOf(obj.itemId) : 0);
    return cur >= objectiveTarget(obj);
  },

  isAllObjectivesComplete: (id) => {
    const def = getQuestRegistry().get(id);
    const p = get().state[id];
    if (!def || !p) return false;
    return def.objectives.every((o) => get().isObjectiveComplete(def, p, o));
  },

  serialize: () => ({
    version: 1,
    state: Object.fromEntries(Object.entries(get().state).map(([k, v]) => [k, { ...v, progress: { ...v.progress } }])),
  }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !data.state
      || typeof data.state !== 'object' || Array.isArray(data.state)) {
      throw new TypeError('Invalid quest snapshot');
    }
    const state = Object.fromEntries(Object.entries(data.state).map(([id, entry]) => {
      if (!id.trim() || !entry || typeof entry !== 'object' || entry.questId !== id
        || !['locked', 'available', 'active', 'completed', 'failed'].includes(entry.status)
        || !entry.progress || typeof entry.progress !== 'object' || Array.isArray(entry.progress)
        || (entry.startedAt !== undefined && (!Number.isFinite(entry.startedAt) || entry.startedAt < 0))
        || (entry.completedAt !== undefined && (!Number.isFinite(entry.completedAt) || entry.completedAt < 0))) {
        throw new TypeError('Invalid quest progress');
      }
      const progress = Object.fromEntries(Object.entries(entry.progress).map(([objectiveId, count]) => {
        if (!objectiveId.trim() || !Number.isSafeInteger(count) || count < 0) {
          throw new TypeError('Invalid quest objective count');
        }
        return [objectiveId, count];
      }));
      return [id, { ...entry, progress }];
    }));
    return () => set({ state });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
