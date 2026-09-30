import { useEffect, useRef } from 'react';

import { useTimeStoreApi } from '../../time/stores/timeStore';
import { CLIMATE_PERIOD_MINUTES, resolveWeather, type WeatherSelection } from '../core/climate';
import { useWeatherStoreApi } from '../stores/weatherStore';

/**
 * Keeps this runtime's weather store on a selection: a hand-picked weather wins, else the climate's seeded schedule
 * moves it every quarter day and with the season. An inactive selection (no weather, climate `off`) leaves the store to
 * others, and turning a selection off clears the sky. Writes only when the resolved weather changes.
 */
export function useWeatherSource({ manual, climate, seed = 0 }: WeatherSelection): void {
  const weatherStore = useWeatherStoreApi();
  const timeStore = useTimeStoreApi();
  const owned = useRef(false);

  useEffect(() => {
    const active = manual !== null || climate !== 'off';
    const apply = () => {
      const { totalMinutes, time } = timeStore.getState();
      const entry = resolveWeather({ manual, climate, seed }, { totalMinutes, season: time.season });
      const current = weatherStore.getState().current;
      if (!entry) {
        if (current && current.kind !== 'sunny') weatherStore.getState().setWeather('sunny', 0.5, current.day);
        return;
      }
      if (current?.kind !== entry.kind || current.intensity !== entry.intensity) {
        weatherStore.getState().setWeather(entry.kind, entry.intensity, entry.day);
      }
    };
    if (!active) {
      if (owned.current) apply();
      owned.current = false;
      return undefined;
    }
    owned.current = true;
    apply();
    if (manual !== null) return undefined;
    return timeStore.subscribe((state, previous) => {
      const period = Math.floor(state.totalMinutes / CLIMATE_PERIOD_MINUTES);
      if (period !== Math.floor(previous.totalMinutes / CLIMATE_PERIOD_MINUTES) || state.time.season !== previous.time.season) apply();
    });
  }, [manual, climate, seed, timeStore, weatherStore]);
}
