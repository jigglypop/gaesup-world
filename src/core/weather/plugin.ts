import type { GaesupPlugin, PluginContext } from '../plugins';
import { useWeatherStore, type WeatherStore } from './stores/weatherStore';
import type { WeatherSerialized } from './types';

export interface WeatherPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.weather';
const DEFAULT_SAVE_EXTENSION_ID = 'weather';
const DEFAULT_STORE_SERVICE_ID = 'weather.store';

export function serializeWeatherState(store: WeatherStore = useWeatherStore): WeatherSerialized {
  return store.getState().serialize();
}

export function hydrateWeatherState(data: WeatherSerialized | null | undefined, store: WeatherStore = useWeatherStore): void {
  store.getState().hydrate(data);
}

export function createWeatherPlugin(options: WeatherPluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup Weather',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['weather'],
    setup(ctx: PluginContext) {
      const weather = ctx.services.get<WeatherStore>('gaesup.runtime.weather-store') ?? useWeatherStore;
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: () => serializeWeatherState(weather),
        hydrate: (data: WeatherSerialized | null | undefined) => hydrateWeatherState(data, weather),
        prepareHydrate: (data: WeatherSerialized | null | undefined) => weather.getState().prepareHydrate(data),
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: weather,
        getState: weather.getState,
        setState: weather.setState,
      }, pluginId);
      ctx.events.emit('weather:ready', {
        pluginId,
        saveExtensionId,
        storeServiceId,
      });
    },
    dispose(ctx) {
      ctx.save.remove(saveExtensionId);
      ctx.services.remove(storeServiceId);
    },
  };
}

export const weatherPlugin = createWeatherPlugin();
