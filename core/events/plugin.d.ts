import type { EventsSerialized } from './types';
export interface EventsPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeEventsState(): EventsSerialized;
export declare function hydrateEventsState(data: EventsSerialized | null | undefined): void;
export declare function createEventsPlugin(options?: EventsPluginOptions): import("..").GaesupPlugin;
export declare const eventsPlugin: import("..").GaesupPlugin;
