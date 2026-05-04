import { createStoreDomainPlugin } from '../plugins';
import { useCatalogStore } from './stores/catalogStore';
import type { CatalogSerialized } from './types';

export interface CatalogPluginOptions {
  id?: string;
  saveExtensionId?: string;
  storeServiceId?: string;
}

const DEFAULT_PLUGIN_ID = 'gaesup.catalog';
const DEFAULT_SAVE_EXTENSION_ID = 'catalog';
const DEFAULT_STORE_SERVICE_ID = 'catalog.store';

export function serializeCatalogState(): CatalogSerialized {
  return useCatalogStore.getState().serialize();
}

export function hydrateCatalogState(data: CatalogSerialized | null | undefined): void {
  useCatalogStore.getState().hydrate(data);
}

export function createCatalogPlugin(options: CatalogPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? DEFAULT_PLUGIN_ID,
    name: 'GaeSup Catalog',
    saveExtensionId: options.saveExtensionId ?? DEFAULT_SAVE_EXTENSION_ID,
    storeServiceId: options.storeServiceId ?? DEFAULT_STORE_SERVICE_ID,
    store: useCatalogStore,
    readyEvent: 'catalog:ready',
    capabilities: ['catalog'],
    serialize: serializeCatalogState,
    hydrate: hydrateCatalogState,
  });
}

export const catalogPlugin = createCatalogPlugin();
