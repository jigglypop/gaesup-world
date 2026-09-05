import { useEffect, useRef } from 'react';

import { useTimeStore } from '../stores/timeStore';
import type { GameTime } from '../types';

export function useGameTime(): GameTime {
  return useTimeStore((s) => s.time);
}

export function useTimeOfDay(): { hour: number; minute: number } {
  return useTimeStore((s) => ({ hour: s.time.hour, minute: s.time.minute }));
}

export function useGameClock(enabled: boolean = true): void {
  const tick = useTimeStore((s) => s.tick);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let mounted = true;
    const loop = (t: number) => {
      if (!mounted) return;
      const last = lastRef.current || t;
      const delta = t - last;
      lastRef.current = t;
      tick(delta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [enabled, tick]);
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
