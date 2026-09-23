import { createStoreDomainPlugin } from '../plugins';
import { useTimeStore } from './stores/timeStore';
import type { TimeSerialized } from './types';

export type TimePluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.time';
const DEFAULT_SAVE_EXTENSION_ID = 'time';
const DEFAULT_STORE_SERVICE_ID = 'time.store';

export function serializeTimeState(): TimeSerialized {
  return useTimeStore.getState().serialize();
}

export function hydrateTimeState(data: TimeSerialized | null | undefined): void {
  useTimeStore.getState().hydrate(data);
}

export function createTimePlugin(options: TimePluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Time',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useTimeStore,
    readyEvent: 'time:ready',
    capabilities: ['time'],
    serialize: serializeTimeState,
    hydrate: hydrateTimeState,
    prepareHydrate: (data) => useTimeStore.getState().prepareHydrate(data),
  });
}

export const timePlugin = createTimePlugin();
