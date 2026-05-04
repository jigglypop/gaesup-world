import { createStoreDomainPlugin } from '../plugins';
import { useInventoryStore } from './stores/inventoryStore';
import type { InventorySerialized } from './types';

export interface InventoryPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.inventory';
const DEFAULT_SAVE_EXTENSION_ID = 'inventory';
const DEFAULT_STORE_SERVICE_ID = 'inventory.store';

export function serializeInventoryState(): InventorySerialized {
  return useInventoryStore.getState().serialize();
}

export function hydrateInventoryState(data: InventorySerialized | null | undefined): void {
  useInventoryStore.getState().hydrate(data);
}

export function createInventoryPlugin(options: InventoryPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Inventory',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useInventoryStore,
    readyEvent: 'inventory:ready',
    capabilities: ['inventory'],
    serialize: serializeInventoryState,
    hydrate: hydrateInventoryState,
  });
}

export const inventoryPlugin = createInventoryPlugin();
