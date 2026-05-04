import { createStoreDomainPlugin } from '../plugins';
import { useCraftingStore } from './stores/craftingStore';
import type { CraftingSerialized } from './types';

export interface CraftingPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.crafting';
const DEFAULT_SAVE_EXTENSION_ID = 'crafting';
const DEFAULT_STORE_SERVICE_ID = 'crafting.store';

export function serializeCraftingState(): CraftingSerialized {
  return useCraftingStore.getState().serialize();
}

export function hydrateCraftingState(data: CraftingSerialized | null | undefined): void {
  useCraftingStore.getState().hydrate(data);
}

export function createCraftingPlugin(options: CraftingPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Crafting',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useCraftingStore,
    readyEvent: 'crafting:ready',
    capabilities: ['crafting'],
    serialize: serializeCraftingState,
    hydrate: hydrateCraftingState,
  });
}

export const craftingPlugin = createCraftingPlugin();
