import type { ExtensionRegistry, KnownExtensionId, RegistryEntry } from './types';
export declare class DuplicateExtensionError extends Error {
    constructor(id: string, options?: {
        registryName?: string | undefined;
        existingPluginId?: string | undefined;
        pluginId?: string | undefined;
    });
}
export declare class MissingExtensionError extends Error {
    constructor(id: string, registryName?: string);
}
export interface InMemoryExtensionRegistryOptions {
    name?: string;
}
export declare class InMemoryExtensionRegistry<TValue = unknown, TMap extends object = Record<never, never>> implements ExtensionRegistry<TValue, TMap> {
    private readonly entries;
    private readonly name;
    constructor(options?: InMemoryExtensionRegistryOptions | string);
    register<TId extends KnownExtensionId<TMap>>(id: TId, value: TMap[TId], pluginId?: string): void;
    register<TId extends string>(id: TId, value: TId extends KnownExtensionId<TMap> ? never : TValue, pluginId?: string): void;
    get<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId] | undefined;
    require<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId];
    has(id: string): boolean;
    remove(id: string): boolean;
    removeByPlugin(pluginId: string): number;
    list(): Array<RegistryEntry<TValue>>;
    clear(): void;
}
