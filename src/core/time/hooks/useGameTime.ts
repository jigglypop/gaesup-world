import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { getTimeClock } from '../core/timeClock';
import { useTimeStore, useTimeStoreApi } from '../stores/timeStore';
import type { GameTime } from '../types';

export function useGameTime(): GameTime {
  return useTimeStore((s) => s.time);
}

export function useTimeOfDay(): { hour: number; minute: number } {
  return useTimeStore(useShallow((s) => ({ hour: s.time.hour, minute: s.time.minute })));
}

export function useGameClock(enabled: boolean = true): void {
  const store = useTimeStoreApi();
  useEffect(() => {
    if (!enabled) return;
    return getTimeClock(store).acquire();
  }, [enabled, store]);
}

export function useDayChange(handler: (g: GameTime) => void): void {
  const addListener = useTimeStore((s) => s.addListener);
  useEffect(() => {
    return addListener((e) => {
      if (e.kind === 'newDay') handler(e.time);
    });
  }, [addListener, handler]);
}

export function useHourChange(handler: (g: GameTime) => void): void {
  const addListener = useTimeStore((s) => s.addListener);
  useEffect(() => {
    return addListener((e) => {
      if (e.kind === 'newHour') handler(e.time);
    });
  }, [addListener, handler]);
}
