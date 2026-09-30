import type { WeatherStore } from './weatherStore';
import { createSharedObserver } from '../../stores/sharedObserver';
import { dayOfTotalMinutes } from '../../time/core/Clock';
import type { TimeStore } from '../../time/stores/timeStore';

export const acquireWeatherTicker = createSharedObserver<TimeStore, WeatherStore>((time, weather, { active }) => {
  const apply = () => {
    if (!active()) return;
    const state = time.getState(); const day = dayOfTotalMinutes(state.totalMinutes); const current = weather.getState().current;
    if (!current || current.day !== day) weather.getState().rollForDay(day, state.time.season);
  };
  const off = time.subscribe((state, previous) => {
    if (state.hydrationRevision !== previous.hydrationRevision) return;
    if (dayOfTotalMinutes(state.totalMinutes) !== dayOfTotalMinutes(previous.totalMinutes)) apply();
  });
  try { apply(); return off; } catch (error) { off(); throw error; }
});
