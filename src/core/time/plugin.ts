import type { GaesupPlugin, PluginContext } from '../plugins';
import { RUNTIME_TIME_STORE_SERVICE_ID } from './core/timeClock';
import { useTimeStore, type TimeStore } from './stores/timeStore';
import type { TimeSerialized } from './types';

export interface TimePluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.time';
const DEFAULT_SAVE_EXTENSION_ID = 'time';
const DEFAULT_STORE_SERVICE_ID = 'time.store';

export function serializeTimeState(): TimeSerialized {
  return useTimeStore.getState().serialize();
}

export function hydrateTimeState(data: TimeSerialized | null | undefined): void {
  useTimeStore.getState().hydrate(data);
}

export function createTimePlugin(options: TimePluginOptions = {}): GaesupPlugin {
  const pluginId = options.id ?? DEFAULT_PLUGIN_ID;
  const saveExtensionId = options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID;
  const storeServiceId = options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID;

  return {
    id: pluginId,
    name: 'GaeSup Time',
    version: '0.1.0',
    runtime: 'client',
    capabilities: ['time'],
    setup(ctx: PluginContext) {
      const store = ctx.services.get<TimeStore>(RUNTIME_TIME_STORE_SERVICE_ID) ?? useTimeStore;
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: () => store.getState().serialize(),
        hydrate: (data: TimeSerialized | null | undefined) => store.getState().hydrate(data),
        prepareHydrate: (data: TimeSerialized | null | undefined) => store.getState().prepareHydrate(data),
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: store,
        getState: store.getState,
        setState: store.setState,
      }, pluginId);
      ctx.events.emit('time:ready', {
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

export const timePlugin = createTimePlugin();
