import type { GaesupPlugin } from '../plugins';
import type { TimeSerialized } from './types';
export interface TimePluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeTimeState(): TimeSerialized;
export declare function hydrateTimeState(data: TimeSerialized | null | undefined): void;
export declare function createTimePlugin(options?: TimePluginOptions): GaesupPlugin;
export declare const timePlugin: GaesupPlugin;
