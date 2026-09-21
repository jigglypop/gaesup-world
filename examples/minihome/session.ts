import { createSceneDocumentController } from 'gaesup-world';

import { parseMinihome } from './model';
import type { MinihomeData } from './types';

const HISTORY_LIMIT = 50;

export function adoptSharedMinihome(local: MinihomeData, shared: MinihomeData) {
  const session = createMinihomeSession(local);
  session.update({ ...local, profile: shared.profile, theme: shared.theme, room: shared.room, terrain: shared.terrain, roomSettings: shared.roomSettings });
  return session;
}

export function createMinihomeSession(initial: MinihomeData) {
  const controller = createSceneDocumentController(initial.room);
  let data = { ...initial, room: controller.getSnapshot() };
  const past: MinihomeData[] = [];
  const future: MinihomeData[] = [];
  const listeners = new Set<() => void>();
  let applying = false;
  let snapshot = { data, canUndo: false, canRedo: false };
  function notify() {
    snapshot = { data, canUndo: past.length > 0, canRedo: future.length > 0 };
    for (const listener of listeners) listener();
  }
  function commit(next: MinihomeData) {
    if (JSON.stringify(data) === JSON.stringify(next)) return;
    past.push(data);
    if (past.length > HISTORY_LIMIT) past.shift();
    future.length = 0;
    data = next;
    notify();
  }
  function apply(next: MinihomeData) {
    applying = true;
    try {
      const result = controller.dispatch({ type: 'scene-document.replace', document: next.room });
      if (!result.accepted) throw new TypeError('Invalid room document.');
      return { ...next, room: controller.getSnapshot() };
    } finally {
      applying = false;
    }
  }
  const unsubscribe = controller.subscribe((room) => {
    if (!applying) commit({ ...data, room });
  });
  return {
    controller,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    update(input: MinihomeData | ((previous: MinihomeData) => MinihomeData)) {
      const next = typeof input === 'function' ? input(data) : input;
      const parsed = parseMinihome(JSON.stringify(next));
      if (!parsed) throw new TypeError('Invalid mini-home data.');
      commit(next.room === data.room ? { ...parsed, room: data.room } : apply(parsed));
    },
    undo() {
      const previous = past.pop();
      if (!previous) return;
      future.push(data);
      data = apply(previous);
      notify();
    },
    redo() {
      const next = future.pop();
      if (!next) return;
      past.push(data);
      data = apply(next);
      notify();
    },
    dispose() { unsubscribe(); listeners.clear(); },
  };
}
