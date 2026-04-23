import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { DomainBinding, Migration, SaveAdapter, SaveBlob, SaveSystemOptions, SerializedDomainValue } from '../types';

export class SaveSystem {
  private adapter: SaveAdapter;
  private bindings = new Map<string, DomainBinding>();
  private currentVersion: number;
  private migrations: Record<number, Migration>;
  private defaultSlot: string;

  constructor(opts: SaveSystemOptions) {
    this.adapter = opts.adapter;
    this.currentVersion = opts.currentVersion ?? 1;
    this.migrations = opts.migrations ?? {};
    this.defaultSlot = opts.defaultSlot ?? 'main';
  }

  register<T extends SerializedDomainValue>(binding: DomainBinding<T>): () => void {
    const normalizedBinding: DomainBinding = {
      key: binding.key,
      serialize: () => binding.serialize(),
      hydrate: (data) => binding.hydrate(data as T | null | undefined),
    };
    this.bindings.set(binding.key, normalizedBinding);
    return () => { this.bindings.delete(binding.key); };
  }

  has(key: string): boolean { return this.bindings.has(key); }

  /**
   * Returns an iterator over registered domain bindings. Used by helpers
   * such as the visit-room snapshot serializer that need to read the
   * same set of (de)serializers as the autosave layer.
   */
  getBindings(): IterableIterator<DomainBinding> { return this.bindings.values(); }

  async save(slot: string = this.defaultSlot): Promise<void> {
    const domains: SaveBlob['domains'] = {};
    for (const [key, b] of this.bindings) {
      try { domains[key] = b.serialize(); } catch { domains[key] = null; }
    }
    const blob: SaveBlob = {
      version: this.currentVersion,
      savedAt: Date.now(),
      domains,
    };
    await this.adapter.write(slot, blob);
  }

  async load(slot: string = this.defaultSlot): Promise<boolean> {
    const raw = await this.adapter.read(slot);
    if (!raw) return false;
    let blob = raw;
    while (blob.version < this.currentVersion) {
      const m = this.migrations[blob.version];
      if (!m) break;
      blob = m(blob);
    }
    for (const [key, b] of this.bindings) {
      try { b.hydrate(blob.domains?.[key]); } catch { void 0; }
    }
    return true;
  }

  async list(): Promise<string[]> { return this.adapter.list(); }
  async remove(slot: string = this.defaultSlot): Promise<void> { return this.adapter.remove(slot); }
}

let _instance: SaveSystem | null = null;

export function createDefaultSaveSystem(): SaveSystem {
  const adapter: SaveAdapter = (typeof indexedDB !== 'undefined')
    ? new IndexedDBAdapter()
    : new LocalStorageAdapter();
  return new SaveSystem({ adapter, defaultSlot: 'main', currentVersion: 1 });
}

export function getSaveSystem(): SaveSystem {
  if (!_instance) _instance = createDefaultSaveSystem();
  return _instance;
}
