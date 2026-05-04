import { createStoreDomainPlugin } from '../plugins';
import { useTownStore } from './stores/townStore';
import type { TownSerialized } from './types';

export interface TownPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.town';
const DEFAULT_SAVE_EXTENSION_ID = 'town';
const DEFAULT_STORE_SERVICE_ID = 'town.store';

export function serializeTownState(): TownSerialized {
  return useTownStore.getState().serialize();
}

export function hydrateTownState(data: TownSerialized | null | undefined): void {
  useTownStore.getState().hydrate(data);
}

export function createTownPlugin(options: TownPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Town',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useTownStore,
    readyEvent: 'town:ready',
    capabilities: ['town'],
    serialize: serializeTownState,
    hydrate: hydrateTownState,
  });
}

export const townPlugin = createTownPlugin();
