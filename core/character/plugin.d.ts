import type { CharacterSerialized } from './types';
export interface CharacterPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeCharacterState(): CharacterSerialized;
export declare function hydrateCharacterState(data: CharacterSerialized | null | undefined): void;
export declare function createCharacterPlugin(options?: CharacterPluginOptions): import("..").GaesupPlugin;
export declare const characterPlugin: import("..").GaesupPlugin;
