import { useEffect } from 'react';

import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../stores/weatherStore';

export function useWeatherTicker(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const apply = () => {
      const s = useTimeStore.getState();
      const day = Math.floor(s.totalMinutes / (60 * 24));
      const cur = useWeatherStore.getState().current;
      if (!cur || cur.day !== day) {
        useWeatherStore.getState().rollForDay(day, s.time.season);
      }
    };
    apply();
    const off = useTimeStore.subscribe((state, prev) => {
      const dayNow = Math.floor(state.totalMinutes / (60 * 24));
      const dayPrev = Math.floor(prev.totalMinutes / (60 * 24));
      if (dayNow !== dayPrev) apply();
    });
    return off;
  }, [enabled]);
}
