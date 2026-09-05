import { create } from 'zustand';

import { computeGameTime, isNewDay, isNewHour, realMsToGameMinutes } from '../core/Clock';
import type { GameTime, TimeMode, TimeSerialized } from '../types';

type TimeListener = (event: { kind: 'newDay' | 'newHour'; time: GameTime }) => void;

type TimeState = {
  mode: TimeMode;
  scale: number;
  startEpochMs: number;
  totalMinutes: number;
  paused: boolean;
  time: GameTime;
  listeners: Set<TimeListener>;

  tick: (realDeltaMs: number) => void;
  setScale: (scale: number) => void;
  setMode: (mode: TimeMode) => void;
  setTotalMinutes: (totalMinutes: number) => void;
  pause: () => void;
  resume: () => void;
  addListener: (l: TimeListener) => () => void;

  serialize: () => TimeSerialized;
  hydrate: (s: TimeSerialized | null | undefined) => void;
  prepareHydrate: (data: TimeSerialized | null | undefined) => () => void;
};

const DEFAULT_SCALE = 1;
const INITIAL_TOTAL_MINUTES = 8 * 60;
const REAL_MS_PER_MINUTE = 60_000;

function emit(listeners: Set<TimeListener>, kind: 'newDay' | 'newHour', time: GameTime) {
  listeners.forEach((l) => {
    try { l({ kind, time }); } catch { void 0; }
  });
}

export const useTimeStore = create<TimeState>((set, get) => ({
  mode: 'scaled',
  scale: DEFAULT_SCALE,
  startEpochMs: Date.now() - INITIAL_TOTAL_MINUTES * REAL_MS_PER_MINUTE,
  totalMinutes: INITIAL_TOTAL_MINUTES,
  paused: false,
  time: computeGameTime(INITIAL_TOTAL_MINUTES),
  listeners: new Set<TimeListener>(),

  tick: (realDeltaMs: number) => {
    const s = get();
    if (s.paused || realDeltaMs <= 0) return;
    let nextMinutes = s.totalMinutes;
    if (s.mode === 'scaled') {
      nextMinutes = s.totalMinutes + realMsToGameMinutes(realDeltaMs, s.scale);
    } else {
      const now = Date.now();
      const realStart = s.startEpochMs;
      nextMinutes = (now - realStart) / REAL_MS_PER_MINUTE;
    }
    if (nextMinutes === s.totalMinutes) return;
    const newDay = isNewDay(s.totalMinutes, nextMinutes);
    const newHour = isNewHour(s.totalMinutes, nextMinutes);
    const time = computeGameTime(nextMinutes);
    set({ totalMinutes: nextMinutes, time });
    if (newHour) emit(s.listeners, 'newHour', time);
    if (newDay) emit(s.listeners, 'newDay', time);
  },

  setScale: (scale: number) => set({ scale: Math.max(0.001, scale) }),
  setMode: (mode: TimeMode) => {
    if (mode === get().mode) return;
    set({ mode, startEpochMs: Date.now() - get().totalMinutes * REAL_MS_PER_MINUTE });
  },
  setTotalMinutes: (totalMinutes: number) =>
    set({ totalMinutes, time: computeGameTime(totalMinutes), startEpochMs: Date.now() - totalMinutes * REAL_MS_PER_MINUTE }),
  pause: () => set({ paused: true }),
  resume: () => {
    if (!get().paused) return;
    set({ paused: false, startEpochMs: Date.now() - get().totalMinutes * REAL_MS_PER_MINUTE });
  },

  addListener: (l: TimeListener) => {
    const s = get();
    s.listeners.add(l);
    return () => { s.listeners.delete(l); };
  },

  serialize: (): TimeSerialized => {
    const s = get();
    return {
      version: 1,
      totalMinutes: s.totalMinutes,
      startEpochMs: s.startEpochMs,
      mode: s.mode,
      scale: s.scale,
      pausedAt: s.paused ? Date.now() : null,
    };
  },

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 ||
      ![data.totalMinutes, data.startEpochMs, data.scale].every(
        (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
      ) || data.scale === 0 || (data.mode !== 'scaled' && data.mode !== 'realtime') ||
      (data.pausedAt !== null && (typeof data.pausedAt !== 'number' || !Number.isFinite(data.pausedAt) || data.pausedAt < 0))) {
      throw new TypeError('Invalid time snapshot');
    }
    const { totalMinutes, mode, scale, startEpochMs } = data;
    const time = computeGameTime(totalMinutes);
    return () => set({
      totalMinutes,
      time,
      mode,
      scale,
      startEpochMs,
      paused: false,
    });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
