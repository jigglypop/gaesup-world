import { createStoreDomainPlugin, type GaesupPlugin } from '../plugins';
import { useWeatherStore, type WeatherStore } from './stores/weatherStore';
import type { WeatherSerialized } from './types';

export type WeatherPluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.weather';
const DEFAULT_SAVE_EXTENSION_ID = 'weather';
const RUNTIME_STORE_SERVICE_ID = 'gaesup.runtime.weather-store';
const DEFAULT_STORE_SERVICE_ID = 'weather.store';

export function serializeWeatherState(store: WeatherStore = useWeatherStore): WeatherSerialized {
  return store.getState().serialize();
}

export function hydrateWeatherState(data: WeatherSerialized | null | undefined, store: WeatherStore = useWeatherStore): void {
  store.getState().hydrate(data);
}

export function createWeatherPlugin(options: WeatherPluginOptions = {}): GaesupPlugin {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Weather',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useWeatherStore,
    readyEvent: 'weather:ready',
    capabilities: ['weather'],
    resolveStore: (ctx) => ctx.services.get<WeatherStore>(RUNTIME_STORE_SERVICE_ID) ?? useWeatherStore,
    serialize: serializeWeatherState,
    hydrate: hydrateWeatherState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const weatherPlugin = createWeatherPlugin();
