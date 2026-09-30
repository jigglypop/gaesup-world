import { createStoreDomainPlugin, type GaesupPlugin } from '../plugins';
import { RUNTIME_TIME_STORE_SERVICE_ID } from './core/timeClock';
import { useTimeStore, type TimeStore } from './stores/timeStore';
import type { TimeSerialized } from './types';

export type TimePluginOptions = {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
};

const DEFAULT_PLUGIN_ID = 'gaesup.time';
const DEFAULT_SAVE_EXTENSION_ID = 'time';
const DEFAULT_STORE_SERVICE_ID = 'time.store';

export function serializeTimeState(store: TimeStore = useTimeStore): TimeSerialized {
  return store.getState().serialize();
}

export function hydrateTimeState(data: TimeSerialized | null | undefined, store: TimeStore = useTimeStore): void {
  store.getState().hydrate(data);
}

export function createTimePlugin(options: TimePluginOptions = {}): GaesupPlugin {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Time',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useTimeStore,
    readyEvent: 'time:ready',
    capabilities: ['time'],
    resolveStore: (ctx) => ctx.services.get<TimeStore>(RUNTIME_TIME_STORE_SERVICE_ID) ?? useTimeStore,
    serialize: serializeTimeState,
    hydrate: hydrateTimeState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const timePlugin = createTimePlugin();
