import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import type { DomainBinding, Migration, SaveAdapter, SaveBlob, SaveSystemOptions } from '../types';

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

  register<T>(binding: DomainBinding<T>): () => void {
    this.bindings.set(binding.key, binding as DomainBinding);
    return () => { this.bindings.delete(binding.key); };
  }

  has(key: string): boolean { return this.bindings.has(key); }

  async save(slot: string = this.defaultSlot): Promise<void> {
    const domains: Record<string, unknown> = {};
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
