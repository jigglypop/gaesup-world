import type { TownSerialized } from './types';
export interface TownPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeTownState(): TownSerialized;
export declare function hydrateTownState(data: TownSerialized | null | undefined): void;
export declare function createTownPlugin(options?: TownPluginOptions): import("..").GaesupPlugin;
export declare const townPlugin: import("..").GaesupPlugin;
