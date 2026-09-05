import { create } from 'zustand';

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
  goTo: (id: SceneId, options?: { entry?: SceneEntry; saveReturn?: SceneEntry }) => Promise<void>;
  setTransition: (next: Partial<TransitionState>) => void;
  setReturnPoint: (entry: SceneEntry | null) => void;

  serialize: () => SceneSerialized;
  hydrate: (data: SceneSerialized | null | undefined) => void;
  prepareHydrate: (data: SceneSerialized | null | undefined) => () => void;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const FADE_OUT_MS = 220;
const HOLD_MS = 80;
const FADE_IN_MS = 240;
let transitionGeneration = 0;

export const useSceneStore = create<SceneState>((set, get) => ({
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

  unregisterScene: (id) =>
    set((state) => {
      if (id === DEFAULT_SCENE_ID) return state;
      if (!state.scenes[id]) return state;
      const scenes = { ...state.scenes };
      delete scenes[id];
      return { scenes };
    }),

  setTransition: (next) =>
    set((state) => ({ transition: { ...state.transition, ...next } })),

  setReturnPoint: (entry) => set({ lastReturnPoint: entry }),

  goTo: async (id, options) => {
    const state = get();
    if (state.pending) return; // Coalesce concurrent navigations.
    if (id === state.current && !options?.entry) return;
    const target = state.scenes[id];
    if (!target) {
      logger.warn(`[scene] Unknown scene "${id}". Did you forget to register it?`);
      return;
    }

    const interior = target.interior ?? false;
    const color = interior ? '#0d0d10' : '#f5f5f5';
    const generation = ++transitionGeneration;

    set({ pending: id, transition: { active: true, color, progress: 0 } });

    // Fade out.
    const start = performance.now();
    while (true) {
      if (generation !== transitionGeneration) return;
      const t = Math.min(1, (performance.now() - start) / FADE_OUT_MS);
      get().setTransition({ progress: t });
      if (t >= 1) break;
      await wait(16);
    }

    if (generation !== transitionGeneration) return;
    set({ current: id, ...(options?.saveReturn ? { lastReturnPoint: options.saveReturn } : {}) });

    // Hold a few frames so consumers can swap world content under the cover.
    await wait(HOLD_MS);

    const fadeStart = performance.now();
    while (true) {
      if (generation !== transitionGeneration) return;
      const t = Math.min(1, (performance.now() - fadeStart) / FADE_IN_MS);
      get().setTransition({ progress: 1 - t });
      if (t >= 1) break;
      await wait(16);
    }

    if (generation === transitionGeneration) set({ pending: null, transition: { active: false, color, progress: 0 } });
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
      transitionGeneration++;
      set((state) => ({ current, pending: null, transition: { ...state.transition, active: false, progress: 0 } }));
    };
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
