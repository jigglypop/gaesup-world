import type { CraftingSerialized } from './types';
export interface CraftingPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeCraftingState(): CraftingSerialized;
export declare function hydrateCraftingState(data: CraftingSerialized | null | undefined): void;
export declare function createCraftingPlugin(options?: CraftingPluginOptions): import("..").GaesupPlugin;
export declare const craftingPlugin: import("..").GaesupPlugin;
