import type { ExtensionRegistry, RegistryEntry } from './types';

export class DuplicateExtensionError extends Error {
  constructor(id: string) {
    super(`Extension "${id}" is already registered.`);
    this.name = 'DuplicateExtensionError';
  }
}

export class MissingExtensionError extends Error {
  constructor(id: string) {
    super(`Extension "${id}" is not registered.`);
    this.name = 'MissingExtensionError';
  }
}

export class InMemoryExtensionRegistry<TValue = unknown> implements ExtensionRegistry<TValue> {
  private readonly entries = new Map<string, RegistryEntry<TValue>>();

  register(id: string, value: TValue, pluginId?: string): void {
    if (this.entries.has(id)) {
      throw new DuplicateExtensionError(id);
    }

    const entry: RegistryEntry<TValue> = pluginId === undefined
      ? { id, value }
      : { id, value, pluginId };
    this.entries.set(id, entry);
  }

  get<TResolved extends TValue = TValue>(id: string): TResolved | undefined {
    return this.entries.get(id)?.value as TResolved | undefined;
  }

  require<TResolved extends TValue = TValue>(id: string): TResolved {
    const value = this.get<TResolved>(id);
    if (value === undefined) {
      throw new MissingExtensionError(id);
    }
    return value;
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  list(): Array<RegistryEntry<TValue>> {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}

