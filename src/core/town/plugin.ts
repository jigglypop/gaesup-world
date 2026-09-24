import { createStoreDomainPlugin } from '../plugins';
import { useTownStore, type TownStore, TOWN_STORE_SERVICE } from './stores/townStore';
import type { TownSerialized } from './types';

export interface TownPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.town';
const DEFAULT_SAVE_EXTENSION_ID = 'town';
const DEFAULT_STORE_SERVICE_ID = 'town.store';

export function serializeTownState(store: TownStore = useTownStore): TownSerialized {
  return store.getState().serialize();
}

export function hydrateTownState(data: TownSerialized | null | undefined, store: TownStore = useTownStore): void {
  store.getState().hydrate(data);
}

export function createTownPlugin(options: TownPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Town',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useTownStore,
    resolveStore: context => context.services.get(TOWN_STORE_SERVICE) ?? useTownStore,
    readyEvent: 'town:ready',
    capabilities: ['town'],
    serialize: serializeTownState,
    hydrate: hydrateTownState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const townPlugin = createTownPlugin();
