import { createStoreDomainPlugin } from '../plugins';
import { useCraftingStore, type CraftingStore } from './stores/craftingStore';
import type { CraftingSerialized } from './types';

export interface CraftingPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.crafting';
const DEFAULT_SAVE_EXTENSION_ID = 'crafting';
const DEFAULT_STORE_SERVICE_ID = 'crafting.store';

export function serializeCraftingState(store: CraftingStore = useCraftingStore): CraftingSerialized {
  return store.getState().serialize();
}

export function hydrateCraftingState(data: CraftingSerialized | null | undefined, store: CraftingStore = useCraftingStore): void {
  store.getState().hydrate(data);
}

export function createCraftingPlugin(options: CraftingPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Crafting',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useCraftingStore,
    resolveStore: context => context.services.get<CraftingStore>('gaesup.runtime.crafting-store') ?? useCraftingStore,
    readyEvent: 'crafting:ready',
    capabilities: ['crafting'],
    serialize: serializeCraftingState,
    hydrate: hydrateCraftingState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const craftingPlugin = createCraftingPlugin();
