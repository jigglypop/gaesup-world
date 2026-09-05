import type { ExtensionRegistry, KnownExtensionId, RegistryEntry } from './types';

export class DuplicateExtensionError extends Error {
  constructor(
    id: string,
    options: {
      registryName?: string | undefined;
      existingPluginId?: string | undefined;
      pluginId?: string | undefined;
    } = {},
  ) {
    const registryPrefix = options.registryName ? `${options.registryName} ` : '';
    const existing = options.existingPluginId
      ? ` by plugin "${options.existingPluginId}"`
      : '';
    const incoming = options.pluginId
      ? ` Plugin "${options.pluginId}" cannot register it.`
      : '';
    super(`${registryPrefix}Extension "${id}" is already registered${existing}.${incoming}`);
    this.name = 'DuplicateExtensionError';
  }
}

export class MissingExtensionError extends Error {
  constructor(id: string, registryName?: string) {
    const registryPrefix = registryName ? `${registryName} ` : '';
    super(`${registryPrefix}Extension "${id}" is not registered.`);
    this.name = 'MissingExtensionError';
  }
}

export interface InMemoryExtensionRegistryOptions {
  name?: string;
}

export class InMemoryExtensionRegistry<
  TValue = unknown,
  TMap extends object = Record<never, never>,
> implements ExtensionRegistry<TValue, TMap> {
  private readonly entries = new Map<string, RegistryEntry<unknown>>();
  private readonly name: string | undefined;

  constructor(options: InMemoryExtensionRegistryOptions | string = {}) {
    this.name = typeof options === 'string' ? options : options.name;
  }

  register<TId extends KnownExtensionId<TMap>>(id: TId, value: TMap[TId], pluginId?: string): void;
  register<TId extends string>(
    id: TId,
    value: TId extends KnownExtensionId<TMap> ? never : TValue,
    pluginId?: string,
  ): void;
  register(id: string, value: TValue, pluginId?: string): void {
    const existing = this.entries.get(id);
    if (existing) {
      throw new DuplicateExtensionError(id, {
        registryName: this.name,
        existingPluginId: existing.pluginId,
        pluginId,
      });
    }

    const entry: RegistryEntry<TValue> = pluginId === undefined
      ? { id, value }
      : { id, value, pluginId };
    this.entries.set(id, entry);
  }

  get<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId] | undefined;
  get<TResolved extends TValue = TValue>(id: string): TResolved | undefined {
    return this.entries.get(id)?.value as TResolved | undefined;
  }

  require<TId extends KnownExtensionId<TMap>>(id: TId): TMap[TId];
  require<TResolved extends TValue = TValue>(id: string): TResolved {
    const value = this.entries.get(id)?.value as TResolved | undefined;
    if (value === undefined) {
      throw new MissingExtensionError(id, this.name);
    }
    return value;
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  removeByPlugin(pluginId: string): number {
    let removed = 0;
    for (const [id, entry] of this.entries) {
      if (entry.pluginId !== pluginId) continue;
      this.entries.delete(id);
      removed += 1;
    }
    return removed;
  }

  list(): Array<RegistryEntry<TValue>> {
    return Array.from(this.entries.values()) as Array<RegistryEntry<TValue>>;
  }

  clear(): void {
    this.entries.clear();
  }
}
