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

export interface ExtensionRegistry<TValue = unknown> {
  register(id: string, value: TValue, pluginId?: string): void;
  get<TResolved extends TValue = TValue>(id: string): TResolved | undefined;
  require<TResolved extends TValue = TValue>(id: string): TResolved;
  has(id: string): boolean;
  remove(id: string): boolean;
  list(): Array<RegistryEntry<TValue>>;
  clear(): void;
}

export interface PluginExtensionRegistries {
  grid: ExtensionRegistry;
  placement: ExtensionRegistry;
  catalog: ExtensionRegistry;
  assets: ExtensionRegistry;
  rendering: ExtensionRegistry;
  input: ExtensionRegistry;
  interactions: ExtensionRegistry;
  npc: ExtensionRegistry;
  quests: ExtensionRegistry;
  blueprints: ExtensionRegistry;
  editor: ExtensionRegistry;
  save: ExtensionRegistry;
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
  dependencies?: string[];
  optionalDependencies?: string[];
  setup(ctx: PluginContext): void | Promise<void>;
  dispose?(ctx: PluginContext): void | Promise<void>;
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
}

export interface PluginContextOptions {
  logger?: Partial<PluginLogger>;
}

