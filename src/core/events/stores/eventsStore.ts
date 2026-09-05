import { create } from 'zustand';

import type { GameTime } from '../../time/types';
import { getEventRegistry } from '../registry/EventRegistry';
import type { EventId, EventsSerialized } from '../types';

type State = {
  active: EventId[];
  startedAt: Record<EventId, number>;
  tags: Set<string>;

  refresh: (time: GameTime) => { started: EventId[]; ended: EventId[] };
  isActive: (id: EventId) => boolean;
  hasTag: (tag: string) => boolean;

  serialize: () => EventsSerialized;
  hydrate: (data: EventsSerialized | null | undefined) => void;
  prepareHydrate: (data: EventsSerialized | null | undefined) => () => void;
};

export const useEventsStore = create<State>((set, get) => ({
  active: [],
  startedAt: {},
  tags: new Set<string>(),

  refresh: (time) => {
    const reg = getEventRegistry();
    const next = reg.resolveActive(time);
    const cur = get().active;
    const nextSet = new Set(next);
    const curSet = new Set(cur);
    const started: EventId[] = next.filter((id) => !curSet.has(id));
    const ended: EventId[] = cur.filter((id) => !nextSet.has(id));
    const startedAt = { ...get().startedAt };
    for (const id of started) startedAt[id] = time.totalMinutes;
    for (const id of ended) delete startedAt[id];
    set({ active: next, startedAt, tags: reg.resolveTags(time) });
    return { started, ended };
  },

  isActive: (id) => get().active.includes(id),
  hasTag: (tag) => get().tags.has(tag),

  serialize: () => ({ version: 1, active: [...get().active], startedAt: { ...get().startedAt } }),
  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.active) ||
      !data.startedAt || typeof data.startedAt !== 'object' || Array.isArray(data.startedAt)) {
      throw new TypeError('Invalid events snapshot');
    }
    const active = Array.from(data.active, (id) => {
      if (typeof id !== 'string' || !id.trim()) throw new TypeError('Invalid event ID');
      return id;
    });
    const startedAt = Object.fromEntries(Object.entries(data.startedAt).map(([id, time]) => {
      if (!id.trim() || typeof time !== 'number' || !Number.isFinite(time) || time < 0) {
        throw new TypeError('Invalid event time');
      }
      return [id, time];
    }));
    const tags = new Set(active.flatMap((id) => getEventRegistry().get(id)?.tags ?? []));
    return () => set({ active, startedAt, tags });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
