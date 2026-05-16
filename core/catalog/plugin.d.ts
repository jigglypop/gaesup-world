import type { CatalogSerialized } from './types';
export interface CatalogPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeCatalogState(): CatalogSerialized;
export declare function hydrateCatalogState(data: CatalogSerialized | null | undefined): void;
export declare function createCatalogPlugin(options?: CatalogPluginOptions): import("..").GaesupPlugin;
export declare const catalogPlugin: import("..").GaesupPlugin;
