import type { FarmingSerialized } from './types';
export interface FarmingPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeFarmingState(): FarmingSerialized;
export declare function hydrateFarmingState(data: FarmingSerialized | null | undefined): void;
export declare function createFarmingPlugin(options?: FarmingPluginOptions): import("..").GaesupPlugin;
export declare const farmingPlugin: import("..").GaesupPlugin;
