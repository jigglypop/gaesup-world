import type { GaesupPlugin, PluginContext, PluginContextOptions, PluginDiagnostic, PluginRecord, PluginRegistryApi, PluginStatus } from './types';
export declare class DuplicatePluginError extends Error {
    constructor(id: string);
}
export declare class MissingPluginDependencyError extends Error {
    constructor(pluginId: string, dependencyId: string, versionRange?: string);
}
export declare class PluginVersionMismatchError extends Error {
    constructor(pluginId: string, dependencyId: string, actualVersion: string, versionRange: string);
}
export declare class PluginManifestValidationError extends Error {
    constructor(pluginId: string, reason: string);
}
export declare class CircularPluginDependencyError extends Error {
    constructor(pluginId: string);
}
export declare class PluginRegistry implements PluginRegistryApi {
    private readonly records;
    private readonly setupOrder;
    private readonly options;
    readonly context: PluginContext;
    constructor(options?: PluginContextOptions);
    register(plugin: GaesupPlugin): void;
    use(plugin: GaesupPlugin): Promise<void>;
    setupAll(): Promise<void>;
    setup(id: string): Promise<void>;
    dispose(id: string): Promise<void>;
    disposeAll(): Promise<void>;
    has(id: string): boolean;
    get(id: string): PluginRecord | undefined;
    list(): PluginRecord[];
    status(id: string): PluginStatus | undefined;
    getDiagnostics(): PluginDiagnostic[];
    private setupInternal;
    private toManifest;
    private toDependencyRecord;
    private toDependencyDeclarations;
    private validateManifest;
    private validateDependencyVersion;
    private reportCapabilityDiagnostics;
    private collectCapabilityDiagnostics;
    private collectCapabilityOwners;
    private removeFromSetupOrder;
    private removePluginExtensions;
}
export declare function createPluginRegistry(options?: PluginContextOptions): PluginRegistry;
