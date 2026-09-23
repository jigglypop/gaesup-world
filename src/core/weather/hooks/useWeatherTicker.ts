import { useEffect } from 'react';

import { dayOfTotalMinutes } from '../../time/core/Clock';
import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../stores/weatherStore';

export function useWeatherTicker(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const apply = () => {
      const s = useTimeStore.getState();
      const day = dayOfTotalMinutes(s.totalMinutes);
      const cur = useWeatherStore.getState().current;
      if (!cur || cur.day !== day) {
        useWeatherStore.getState().rollForDay(day, s.time.season);
      }
    };
    apply();
    const off = useTimeStore.subscribe((state, prev) => {
      const dayNow = dayOfTotalMinutes(state.totalMinutes);
      const dayPrev = dayOfTotalMinutes(prev.totalMinutes);
      if (dayNow !== dayPrev) apply();
    });
    return off;
  }, [enabled]);
}
