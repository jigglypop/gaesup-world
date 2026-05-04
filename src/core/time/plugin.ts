import type { GaesupPlugin, PluginContext } from '../plugins';
import { useTimeStore } from './stores/timeStore';
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
      ctx.save.register(saveExtensionId, {
        key: saveExtensionId,
        serialize: serializeTimeState,
        hydrate: hydrateTimeState,
      }, pluginId);
      ctx.services.register(storeServiceId, {
        useStore: useTimeStore,
        getState: useTimeStore.getState,
        setState: useTimeStore.setState,
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
