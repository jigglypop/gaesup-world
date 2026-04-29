import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { DomainBinding, Migration, SaveAdapter, SaveBlob, SaveDiagnostic, SaveSystemOptions } from '../types';

export class SaveSystem {
  private adapter: SaveAdapter;
  private bindings = new Map<string, DomainBinding>();
  private currentVersion: number;
  private migrations: Record<number, Migration>;
  private defaultSlot: string;
  private onDiagnostic: ((diagnostic: SaveDiagnostic) => void) | undefined;

  constructor(opts: SaveSystemOptions) {
    this.adapter = opts.adapter;
    this.currentVersion = opts.currentVersion ?? 1;
    this.migrations = opts.migrations ?? {};
    this.defaultSlot = opts.defaultSlot ?? 'main';
    this.onDiagnostic = opts.onDiagnostic;
  }

  register(binding: DomainBinding): () => void {
    const normalizedBinding: DomainBinding = {
      key: binding.key,
      serialize: () => binding.serialize(),
      hydrate: (data) => binding.hydrate(data),
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
      try {
        domains[key] = b.serialize();
      } catch (error) {
        domains[key] = null;
        this.reportDiagnostic({ phase: 'serialize', key, slot, error });
      }
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
      try {
        b.hydrate(blob.domains?.[key]);
      } catch (error) {
        this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
      }
    }
    return true;
  }

  async list(): Promise<string[]> { return this.adapter.list(); }
  async remove(slot: string = this.defaultSlot): Promise<void> { return this.adapter.remove(slot); }

  private reportDiagnostic(diagnostic: SaveDiagnostic): void {
    this.onDiagnostic?.(diagnostic);
  }
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
