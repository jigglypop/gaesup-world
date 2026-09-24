import { create } from 'zustand';

import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { createScopedStoreHook } from '../../stores/scopedStore';
import { logger } from '../../utils/logger';
import {
  DEFAULT_SCENE_ID,
  type SceneDescriptor,
  type SceneEntry,
  type SceneId,
  type SceneSerialized,
} from '../types';

type TransitionState = {
  /** 0 (no fade) → 1 (fully opaque) */
  progress: number;
  /** Color of the fade overlay (e.g. white for daytime, black for night). */
  color: string;
  /** When true, overlay is currently up; consumers can render their UI. */
  active: boolean;
};

export type SceneTransitionOptions = {
  entry?: SceneEntry;
  saveReturn?: SceneEntry;
  signal?: AbortSignal;
  /** Called once under the opaque fade, only after this transition commits. */
  onEntered?: (entry: SceneEntry | undefined) => void;
};

type SceneState = {
  current: SceneId;
  /** When mid-transition, the id we are heading to. */
  pending: SceneId | null;
  scenes: Record<SceneId, SceneDescriptor>;
  transition: TransitionState;
  /**
   * Last outdoor return point: stored when leaving the outdoor scene so an
   * interior can warp the player back to where they were.
   */
  lastReturnPoint: SceneEntry | null;

  registerScene: (scene: SceneDescriptor) => void;
  unregisterScene: (id: SceneId) => void;
  goTo: (id: SceneId, options?: SceneTransitionOptions) => Promise<void>;
  cancelTransition: () => void;
  suspendTransitions: () => void;
  resumeTransitions: () => void;
  setTransition: (next: Partial<TransitionState>) => void;
  setReturnPoint: (entry: SceneEntry | null) => void;

  serialize: () => SceneSerialized;
  hydrate: (data: SceneSerialized | null | undefined) => void;
  prepareHydrate: (data: SceneSerialized | null | undefined) => () => void;
};

function wait(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const finish = () => { clearTimeout(timer); signal.removeEventListener('abort', finish); resolve(); };
    const timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}

const FADE_OUT_MS = 220;
const HOLD_MS = 80;
const FADE_IN_MS = 240;

export function createSceneStore() {
let active = true;
let operation: AbortController | undefined;
const cancel = () => {
  const previous = operation;
  operation = undefined;
  previous?.abort();
};
return create<SceneState>((set, get) => ({
  current: DEFAULT_SCENE_ID,
  pending: null,
  scenes: {
    [DEFAULT_SCENE_ID]: { id: DEFAULT_SCENE_ID, name: '야외', interior: false },
  },
  transition: { progress: 0, color: '#000000', active: false },
  lastReturnPoint: null,

  registerScene: (scene) =>
    set((state) => {
      if (state.scenes[scene.id]) return state;
      return { scenes: { ...state.scenes, [scene.id]: scene } };
    }),

  unregisterScene: (id) => {
    if (get().pending === id) get().cancelTransition();
    set((state) => {
      if (id === DEFAULT_SCENE_ID) return state;
      if (!state.scenes[id]) return state;
      const scenes = { ...state.scenes };
      delete scenes[id];
      return { scenes };
    });
  },

  setTransition: (next) =>
    set((state) => ({ transition: { ...state.transition, ...next } })),

  setReturnPoint: (entry) => set({ lastReturnPoint: entry }),

  cancelTransition: () => {
    cancel();
    set(state => !state.pending && !state.transition.active ? state : {
      pending: null, transition: { ...state.transition, active: false, progress: 0 },
    });
  },
  suspendTransitions: () => { active = false; get().cancelTransition(); },
  resumeTransitions: () => { active = true; },

  goTo: async (id, options) => {
    const state = get();
    if (!active || options?.signal?.aborted) return;
    if (state.pending) return; // Coalesce concurrent navigations.
    if (id === state.current && !options?.entry) return;
    const target = state.scenes[id];
    if (!target) {
      logger.warn(`[scene] Unknown scene "${id}". Did you forget to register it?`);
      return;
    }

    const interior = target.interior ?? false;
    const color = interior ? '#0d0d10' : '#f5f5f5';
    const controller = new AbortController();
    operation = controller;
    const valid = () => active && operation === controller && !controller.signal.aborted;
    const abort = () => { if (operation === controller) get().cancelTransition(); };
    options?.signal?.addEventListener('abort', abort, { once: true });
    const fade = async (duration: number, incoming: boolean) => {
      const start = performance.now();
      while (valid()) {
        const t = Math.min(1, (performance.now() - start) / duration);
        get().setTransition({ progress: incoming ? 1 - t : t });
        if (t >= 1 || !valid()) break;
        await wait(16, controller.signal);
      }
    };
    try {
      set({ pending: id, transition: { active: true, color, progress: 0 } });
      await fade(FADE_OUT_MS, false);
      if (!valid()) return;
      set({ current: id, ...(options?.saveReturn ? { lastReturnPoint: options.saveReturn } : {}) });
      if (!valid()) return;
      options?.onEntered?.(options.entry ?? target.entry);
      if (!valid()) return;
      // Let mounted scene consumers swap content while the overlay is opaque.
      await wait(HOLD_MS, controller.signal);
      if (valid()) await fade(FADE_IN_MS, true);
    } finally {
      options?.signal?.removeEventListener('abort', abort);
      // An older cancelled task must never clear a replacement transition.
      if (operation === controller) {
        operation = undefined;
        set({ pending: null, transition: { active: false, color, progress: 0 } });
      }
    }
  },

  serialize: () => ({ version: 1, current: get().current }),

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || typeof data.current !== 'string' || !data.current.trim()) {
      throw new TypeError('Invalid scene snapshot');
    }
    const current = data.current;
    if (!Object.hasOwn(get().scenes, current)) return () => {};
    return () => {
      cancel();
      set((state) => ({ current, pending: null, transition: { ...state.transition, active: false, progress: 0 } }));
    };
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
}

export type SceneStore = ReturnType<typeof createSceneStore>;
export const SCENE_STORE_SERVICE = runtimeStoreServiceKey<SceneStore>('scene');
export const { useStore: useSceneStore, useStoreApi: useSceneStoreApi } = createScopedStoreHook(
  createSceneStore(), () => useGaesupRuntime()?.sceneStore,
);
