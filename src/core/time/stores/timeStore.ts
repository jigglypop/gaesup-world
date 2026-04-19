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
};

const DEFAULT_SCALE = 1;
const INITIAL_TOTAL_MINUTES = 8 * 60;

function emit(listeners: Set<TimeListener>, kind: 'newDay' | 'newHour', time: GameTime) {
  listeners.forEach((l) => {
    try { l({ kind, time }); } catch { void 0; }
  });
}

export const useTimeStore = create<TimeState>((set, get) => ({
  mode: 'scaled',
  scale: DEFAULT_SCALE,
  startEpochMs: typeof performance !== 'undefined' ? performance.now() : 0,
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
      nextMinutes = (now - realStart) / 1000 / 60;
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
  setMode: (mode: TimeMode) => set({ mode }),
  setTotalMinutes: (totalMinutes: number) =>
    set({ totalMinutes, time: computeGameTime(totalMinutes) }),
  pause: () => set({ paused: true }),
  resume: () => set({ paused: false }),

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

  hydrate: (data) => {
    if (!data || typeof data !== 'object') return;
    const totalMinutes = Number.isFinite(data.totalMinutes)
      ? data.totalMinutes
      : INITIAL_TOTAL_MINUTES;
    set({
      totalMinutes,
      time: computeGameTime(totalMinutes),
      mode: data.mode ?? 'scaled',
      scale: typeof data.scale === 'number' ? data.scale : DEFAULT_SCALE,
      startEpochMs: typeof data.startEpochMs === 'number' ? data.startEpochMs : 0,
      paused: false,
    });
  },
}));
