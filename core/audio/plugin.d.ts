import type { GaesupPlugin } from '../plugins';
import type { AudioSerialized } from './types';
export interface AudioPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeAudioState(): AudioSerialized;
export declare function hydrateAudioState(data: AudioSerialized | null | undefined): void;
export declare function createAudioPlugin(options?: AudioPluginOptions): GaesupPlugin;
export declare const audioPlugin: GaesupPlugin;
