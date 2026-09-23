export type { CatalogEntry, CatalogSerialized } from './types';
export { CATALOG_CATEGORIES } from './types';
export {
  catalogPlugin,
  createCatalogPlugin,
  hydrateCatalogState,
  serializeCatalogState,
} from './plugin';
export type { CatalogPluginOptions } from './plugin';
export { useCatalogStore, useCatalogStoreApi, createCatalogStore } from './stores/catalogStore';
export { useCatalogTracker } from './hooks/useCatalogTracker';
export { CatalogUI } from './components/CatalogUI';
export type { CatalogUIProps } from './components/CatalogUI';

export type { CatalogStore } from './stores/catalogStore';
