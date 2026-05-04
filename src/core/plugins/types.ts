export type PluginRuntime = 'client' | 'server' | 'both' | 'editor';

export type PluginStatus =
  | 'registered'
  | 'setting-up'
  | 'ready'
  | 'disposing'
  | 'disposed'
  | 'failed';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  runtime: PluginRuntime;
  capabilities: string[];
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export interface PluginLogger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export type EventUnsubscribe = () => void;
export type EventHandler<TPayload = unknown> = (payload: TPayload) => void;

export interface EventBus {
  on<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe;
  once<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): EventUnsubscribe;
  off<TPayload = unknown>(eventName: string, handler: EventHandler<TPayload>): void;
  emit<TPayload = unknown>(eventName: string, payload: TPayload): void;
  clear(eventName?: string): void;
}

export interface RegistryEntry<TValue> {
  id: string;
  value: TValue;
  pluginId?: string;
}

declare const extensionMapBrand: unique symbol;

export interface GridExtensionMap { readonly [extensionMapBrand]?: never; }
export interface PlacementExtensionMap { readonly [extensionMapBrand]?: never; }
export interface CatalogExtensionMap { readonly [extensionMapBrand]?: never; }
export interface AssetExtensionMap { readonly [extensionMapBrand]?: never; }
export interface RenderingExtensionMap { readonly [extensionMapBrand]?: never; }
export interface InputExtensionMap { readonly [extensionMapBrand]?: never; }
export interface InteractionExtensionMap { readonly [extensionMapBrand]?: never; }
export interface NPCExtensionMap { readonly [extensionMapBrand]?: never; }
export interface QuestExtensionMap { readonly [extensionMapBrand]?: never; }
export interface BlueprintExtensionMap { readonly [extensionMapBrand]?: never; }
export interface EditorExtensionMap { readonly [extensionMapBrand]?: never; }
export interface SaveExtensionMap { readonly [extensionMapBrand]?: never; }
export interface ServiceExtensionMap { readonly [extensionMapBrand]?: never; }
export interface SystemExtensionMap { readonly [extensionMapBrand]?: never; }
export interface ComponentExtensionMap { readonly [extensionMapBrand]?: never; }

export type KnownExtensionId<TMap extends object> = Extract<keyof TMap, string>;

export interface ExtensionRegistry<TValue = unknown, TMap extends object = Record<never, never>> {
  register<TId extends KnownExtensionId<TMap>>(id: TId, value: TMap[TId], pluginId?: string): void;
  register<TId extends string>(
    id: TId,
    value: TId extends KnownExtensionId<TMap> ? never : TValue,
    pluginId?: string,
  ): void;
  get<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId] | undefined;
  get<TResolved extends TValue = TValue>(id: string): TResolved | undefined;
  require<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId];
  require<TResolved extends TValue = TValue>(id: string): TResolved;
  has(id: string): boolean;
  remove(id: string): boolean;
  removeByPlugin(pluginId: string): number;
  list(): Array<RegistryEntry<TValue>>;
  clear(): void;
}

export interface PluginExtensionRegistries {
  grid: ExtensionRegistry<unknown, GridExtensionMap>;
  placement: ExtensionRegistry<unknown, PlacementExtensionMap>;
  catalog: ExtensionRegistry<unknown, CatalogExtensionMap>;
  assets: ExtensionRegistry<unknown, AssetExtensionMap>;
  rendering: ExtensionRegistry<unknown, RenderingExtensionMap>;
  input: ExtensionRegistry<unknown, InputExtensionMap>;
  interactions: ExtensionRegistry<unknown, InteractionExtensionMap>;
  npc: ExtensionRegistry<unknown, NPCExtensionMap>;
  quests: ExtensionRegistry<unknown, QuestExtensionMap>;
  blueprints: ExtensionRegistry<unknown, BlueprintExtensionMap>;
  editor: ExtensionRegistry<unknown, EditorExtensionMap>;
  save: ExtensionRegistry<unknown, SaveExtensionMap>;
  services: ExtensionRegistry<unknown, ServiceExtensionMap>;
  systems: ExtensionRegistry<unknown, SystemExtensionMap>;
  components: ExtensionRegistry<unknown, ComponentExtensionMap>;
}

export interface PluginContext extends PluginExtensionRegistries {
  events: EventBus;
  logger: PluginLogger;
  plugins: PluginRegistryApi;
}

export interface GaesupPlugin {
  id: string;
  name: string;
  version: string;
  runtime?: PluginRuntime;
  capabilities?: string[];
  dependencies?: PluginDependencyInput[];
  optionalDependencies?: PluginDependencyInput[];
  setup(ctx: PluginContext): void | Promise<void>;
  dispose?(ctx: PluginContext): void | Promise<void>;
}

export interface PluginDependencyDeclaration {
  id: string;
  version?: string;
}

export type PluginDependencyInput = string | PluginDependencyDeclaration;

export type PluginDiagnosticKind =
  | 'capability-conflict'
  | 'missing-capability';

export interface PluginDiagnostic {
  kind: PluginDiagnosticKind;
  message: string;
  pluginIds: string[];
  capabilities: string[];
}

export interface PluginRecord {
  plugin: GaesupPlugin;
  manifest: PluginManifest;
  status: PluginStatus;
  error?: unknown;
}

export interface PluginRegistryApi {
  has(id: string): boolean;
  get(id: string): PluginRecord | undefined;
  list(): PluginRecord[];
  status(id: string): PluginStatus | undefined;
  getDiagnostics(): PluginDiagnostic[];
}

export interface PluginContextOptions {
  logger?: Partial<PluginLogger>;
  exclusiveCapabilities?: string[];
  capabilityConflicts?: Record<string, string[]>;
  requiredCapabilities?: string[];
}
