import type { RelationsSerialized } from './types';
export interface RelationsPluginOptions {
    id?: string;
    saveExtensionId?: string;
    storeServiceId?: string;
}
export declare function serializeRelationsState(): RelationsSerialized;
export declare function hydrateRelationsState(data: RelationsSerialized | null | undefined): void;
export declare function createRelationsPlugin(options?: RelationsPluginOptions): import("..").GaesupPlugin;
export declare const relationsPlugin: import("..").GaesupPlugin;
