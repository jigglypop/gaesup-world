import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type {
  DomainBinding,
  Migration,
  SaveAdapter,
  SaveBlob,
  SaveDiagnostic,
  SaveDiagnosticListener,
  SaveSystemOptions,
} from '../types';

export class SaveSystem {
  private adapter: SaveAdapter;
  private bindings = new Map<string, DomainBinding>();
  private currentVersion: number;
  private migrations: Record<number, Migration>;
  private defaultSlot: string;
  private diagnosticListeners = new Set<SaveDiagnosticListener>();

  constructor(opts: SaveSystemOptions) {
    this.adapter = opts.adapter;
    this.currentVersion = opts.currentVersion ?? 1;
    this.migrations = opts.migrations ?? {};
    this.defaultSlot = opts.defaultSlot ?? 'main';
    if (opts.onDiagnostic) {
      this.diagnosticListeners.add(opts.onDiagnostic);
    }
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

  subscribeDiagnostics(listener: SaveDiagnosticListener): () => void {
    this.diagnosticListeners.add(listener);
    return () => {
      this.diagnosticListeners.delete(listener);
    };
  }

  /**
   * Returns an iterator over registered domain bindings. Used by helpers
   * such as the visit-room snapshot serializer that need to read the
   * same set of (de)serializers as the autosave layer.
   */
  getBindings(): IterableIterator<DomainBinding> { return this.bindings.values(); }

  createBlob(slot: string = this.defaultSlot): SaveBlob {
    const domains: SaveBlob['domains'] = {};
    for (const [key, b] of this.bindings) {
      try {
        domains[key] = b.serialize();
      } catch (error) {
        domains[key] = null;
        this.reportDiagnostic({ phase: 'serialize', key, slot, error });
      }
    }

    return {
      version: this.currentVersion,
      savedAt: Date.now(),
      domains,
    };
  }

  hydrateBlob(raw: SaveBlob, slot: string = this.defaultSlot): boolean {
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

  async save(slot: string = this.defaultSlot): Promise<void> {
    const blob = this.createBlob(slot);
    await this.adapter.write(slot, blob);
  }

  async load(slot: string = this.defaultSlot): Promise<boolean> {
    const raw = await this.adapter.read(slot);
    if (!raw) return false;
    return this.hydrateBlob(raw, slot);
  }

  async list(): Promise<string[]> { return this.adapter.list(); }
  async remove(slot: string = this.defaultSlot): Promise<void> { return this.adapter.remove(slot); }

  private reportDiagnostic(diagnostic: SaveDiagnostic): void {
    for (const listener of this.diagnosticListeners) {
      listener(diagnostic);
    }
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
