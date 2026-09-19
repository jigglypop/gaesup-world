import type { WeatherStore } from './weatherStore';
import { createSharedObserver } from '../../stores/sharedObserver';
import type { TimeStore } from '../../time/stores/timeStore';

export const acquireWeatherTicker = createSharedObserver<TimeStore, WeatherStore>((time, weather, { active }) => {
  const apply = () => {
    if (!active()) return;
    const state = time.getState(); const day = Math.floor(state.totalMinutes / (60 * 24)); const current = weather.getState().current;
    if (!current || current.day !== day) weather.getState().rollForDay(day, state.time.season);
  };
  const off = time.subscribe((state, previous) => {
    if (state.hydrationRevision !== previous.hydrationRevision) return;
    if (Math.floor(state.totalMinutes / (60 * 24)) !== Math.floor(previous.totalMinutes / (60 * 24))) apply();
  });
  try { apply(); return off; } catch (error) { off(); throw error; }
});
