import type { InventorySerialized } from './types';
export interface InventoryPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeInventoryState(): InventorySerialized;
export declare function hydrateInventoryState(data: InventorySerialized | null | undefined): void;
export declare function createInventoryPlugin(options?: InventoryPluginOptions): import("..").GaesupPlugin;
export declare const inventoryPlugin: import("..").GaesupPlugin;
