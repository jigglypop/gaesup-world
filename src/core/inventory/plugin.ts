import { createStoreDomainPlugin } from '../plugins';
import { useInventoryStore, type InventoryStore, INVENTORY_STORE_SERVICE } from './stores/inventoryStore';
import type { InventorySerialized } from './types';

export interface InventoryPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.inventory';
const DEFAULT_SAVE_EXTENSION_ID = 'inventory';
const DEFAULT_STORE_SERVICE_ID = 'inventory.store';

export function serializeInventoryState(store: InventoryStore = useInventoryStore): InventorySerialized {
  return store.getState().serialize();
}

export function hydrateInventoryState(data: InventorySerialized | null | undefined, store: InventoryStore = useInventoryStore): void {
  store.getState().hydrate(data);
}

export function createInventoryPlugin(options: InventoryPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Inventory',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useInventoryStore,
    resolveStore: ctx => ctx.services.get(INVENTORY_STORE_SERVICE) ?? useInventoryStore,
    readyEvent: 'inventory:ready',
    capabilities: ['inventory'],
    serialize: serializeInventoryState,
    hydrate: hydrateInventoryState,
    prepareHydrate: (data, store) => store.getState().prepareHydrate(data),
  });
}

export const inventoryPlugin = createInventoryPlugin();
