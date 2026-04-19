import { create } from 'zustand';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useWalletStore } from '../../economy/stores/walletStore';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';
import { useTimeStore } from '../../time/stores/timeStore';
import { notify } from '../../ui/components/Toast/toastStore';
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
};

function objectiveTarget(obj: QuestObjective): number {
  if (obj.type === 'collect' || obj.type === 'deliver') return obj.count;
  return 1;
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
    const def = getQuestRegistry().get(id);
    if (!def) return false;
    const cur = get().state[id];
    if (!cur || cur.status !== 'active') return false;
    if (!get().isAllObjectivesComplete(id)) return false;
    for (const o of def.objectives) {
      if (o.type === 'deliver') {
        useInventoryStore.getState().removeById(o.itemId, o.count);
      }
    }
    for (const r of def.rewards) applyReward(r);
    set({ state: { ...get().state, [id]: { ...cur, status: 'completed', completedAt: Date.now() } } });
    notify('success', `퀘스트 완료: ${def.name}`);
    return true;
  },

  notifyTalk: (npcId) => {
    const next = { ...get().state };
    let changed = false;
    for (const [qid, prog] of Object.entries(next)) {
      if (prog.status !== 'active') continue;
      const def = getQuestRegistry().get(qid);
      if (!def) continue;
      for (const o of def.objectives) {
        if (o.type === 'talk' && o.npcId === npcId && (prog.progress[o.id] ?? 0) < 1) {
          next[qid] = { ...prog, progress: { ...prog.progress, [o.id]: 1 } };
          changed = true;
        }
      }
    }
    if (changed) set({ state: next });
  },

  notifyDeliver: (npcId, itemId, count = 1) => {
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
          const taken = Math.min(have, o.count - (prog.progress[o.id] ?? 0), count);
          if (taken <= 0) continue;
          const removed = useInventoryStore.getState().removeById(itemId, taken);
          next[qid] = {
            ...prog,
            progress: { ...prog.progress, [o.id]: (prog.progress[o.id] ?? 0) + removed },
          };
          success = true;
        }
      }
    }
    if (success) set({ state: next });
    return success;
  },

  notifyVisit: (tag) => {
    const next = { ...get().state };
    let changed = false;
    for (const [qid, prog] of Object.entries(next)) {
      if (prog.status !== 'active') continue;
      const def = getQuestRegistry().get(qid);
      if (!def) continue;
      for (const o of def.objectives) {
        if (o.type === 'visit' && o.tag === tag && (prog.progress[o.id] ?? 0) < 1) {
          next[qid] = { ...prog, progress: { ...prog.progress, [o.id]: 1 } };
          changed = true;
        }
      }
    }
    if (changed) set({ state: next });
  },

  notifyFlag: (key, value) => {
    const next = { ...get().state };
    let changed = false;
    for (const [qid, prog] of Object.entries(next)) {
      if (prog.status !== 'active') continue;
      const def = getQuestRegistry().get(qid);
      if (!def) continue;
      for (const o of def.objectives) {
        if (o.type === 'flag' && o.key === key && o.value === value && (prog.progress[o.id] ?? 0) < 1) {
          next[qid] = { ...prog, progress: { ...prog.progress, [o.id]: 1 } };
          changed = true;
        }
      }
    }
    if (changed) set({ state: next });
  },

  recheck: (id) => {
    const def = getQuestRegistry().get(id);
    const prog = get().state[id];
    if (!def || !prog || prog.status !== 'active') return;
    const next = { ...prog };
    for (const o of def.objectives) {
      if (o.type === 'collect') {
        next.progress = { ...next.progress, [o.id]: Math.min(o.count, useInventoryStore.getState().countOf(o.itemId)) };
      }
    }
    set({ state: { ...get().state, [id]: next } });
  },

  statusOf: (id) => get().state[id]?.status ?? 'available',
  progressOf: (id) => get().state[id] ?? null,
  active: () => Object.values(get().state).filter((p) => p.status === 'active'),
  completed: () => Object.values(get().state).filter((p) => p.status === 'completed'),

  isObjectiveComplete: (def, p, obj) => {
    const cur = p.progress[obj.id] ?? 0;
    if (obj.type === 'collect') {
      const have = useInventoryStore.getState().countOf(obj.itemId);
      return have >= obj.count;
    }
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

  hydrate: (data) => {
    if (!data || typeof data !== 'object') return;
    const next: Record<string, QuestProgress> = {};
    if (data.state && typeof data.state === 'object') {
      for (const [k, v] of Object.entries(data.state)) {
        if (!v || typeof v !== 'object') continue;
        next[k] = {
          questId: k,
          status: (v.status as QuestStatus) ?? 'available',
          progress: v.progress && typeof v.progress === 'object' ? { ...v.progress } : {},
          startedAt: v.startedAt,
          completedAt: v.completedAt,
        };
      }
    }
    set({ state: next });
  },
}));
