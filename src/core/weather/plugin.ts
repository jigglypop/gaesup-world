import { createStoreDomainPlugin } from '../plugins';
import { useWeatherStore } from './stores/weatherStore';
import type { WeatherSerialized } from './types';

export type WeatherPluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.weather';
const DEFAULT_SAVE_EXTENSION_ID = 'weather';
const DEFAULT_STORE_SERVICE_ID = 'weather.store';

export function serializeWeatherState(): WeatherSerialized {
  return useWeatherStore.getState().serialize();
}

export function hydrateWeatherState(data: WeatherSerialized | null | undefined): void {
  useWeatherStore.getState().hydrate(data);
}

export function createWeatherPlugin(options: WeatherPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Weather',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useWeatherStore,
    readyEvent: 'weather:ready',
    capabilities: ['weather'],
    serialize: serializeWeatherState,
    hydrate: hydrateWeatherState,
    prepareHydrate: (data) => useWeatherStore.getState().prepareHydrate(data),
  });
}

export const weatherPlugin = createWeatherPlugin();
