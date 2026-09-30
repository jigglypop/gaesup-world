import { Weather, useWeatherSource } from '../../weather';
import { useBuildingStore } from '../stores/buildingStore';

/**
 * The island's saved weather: its picked `weatherEffect` wins, else its `climate` schedule drives the runtime's weather
 * store, and `Weather` draws whatever that store holds.
 */
export function BuildingWeather() {
  const effect = useBuildingStore((state) => state.weatherEffect);
  const climate = useBuildingStore((state) => state.climate);
  useWeatherSource({ manual: effect === 'none' ? null : effect, climate });
  return <Weather />;
}
