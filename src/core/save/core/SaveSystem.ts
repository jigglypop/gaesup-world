import { logger } from '../../utils/logger';
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
  private processing = false;
  private restoreGeneration = 0;
  private pendingMutations = new Map<string, Promise<void>>();

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
    if (this.bindings.has(binding.key)) {
      throw new DuplicateSaveDomainBindingError(binding.key);
    }

    const normalizedBinding: DomainBinding = {
      key: binding.key,
      serialize: () => binding.serialize(),
      hydrate: (data) => binding.hydrate(data),
      ...(binding.prepareHydrate ? { prepareHydrate: (data: Parameters<DomainBinding['hydrate']>[0]) => binding.prepareHydrate!(data) } : {}),
    };
    this.bindings.set(binding.key, normalizedBinding);
    return () => {
      if (this.bindings.get(binding.key) === normalizedBinding) {
        this.bindings.delete(binding.key);
      }
    };
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
    return this.process(() => this.serializeBlob(slot));
  }

  private serializeBlob(slot: string): SaveBlob {
    const domains: SaveBlob['domains'] = {};
    const errors: unknown[] = [];
    for (const [key, b] of this.bindings) {
      try {
        domains[key] = b.serialize();
      } catch (error) {
        errors.push(error);
        this.reportDiagnostic({ phase: 'serialize', key, slot, error });
      }
    }

    if (errors.length > 0) throw new AggregateError(errors, 'Save serialization failed');
    return {
      version: this.currentVersion,
      savedAt: Date.now(),
      domains,
    };
  }

  hydrateBlob(raw: SaveBlob, slot: string = this.defaultSlot): boolean {
    return this.process(() => {
      this.restoreGeneration++;
      return this.applyBlob(raw, slot);
    });
  }

  private applyBlob(raw: SaveBlob, slot: string): boolean {
    let blob = raw;
    validateSaveEnvelope(blob);
    if (!Number.isInteger(blob.version) || blob.version < 1 || blob.version > this.currentVersion) {
      throw new Error(`Unsupported save version: ${blob.version}`);
    }
    while (blob.version < this.currentVersion) {
      const previousVersion = blob.version;
      const m = this.migrations[blob.version];
      if (!m) throw new Error(`Missing save migration: ${blob.version}`);
      blob = m(blob);
      validateSaveEnvelope(blob);
      if (!Number.isInteger(blob.version) || blob.version <= previousVersion || blob.version > this.currentVersion) {
        throw new Error(`Invalid save migration: ${previousVersion} -> ${blob.version}`);
      }
    }
    const errors: unknown[] = [];
    const applications: Array<{ key: string; apply: () => void }> = [];
    for (const [key, binding] of this.bindings) {
      try {
        const data = blob.domains[key];
        applications.push({ key, apply: binding.prepareHydrate
          ? binding.prepareHydrate(data)
          : () => binding.hydrate(data) });
      } catch (error) {
        errors.push(error);
        this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, 'Save hydration failed');
    for (const { key, apply } of applications) {
      try {
        apply();
      } catch (error) {
        errors.push(error);
        this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, 'Save hydration failed');
    return true;
  }

  async save(slot: string = this.defaultSlot): Promise<void> {
    const blob = this.createBlob(slot);
    await this.enqueueMutation(slot, () => this.adapter.write(slot, blob));
  }

  /** An aborted or superseded load returns false without applying the stored domains. */
  async load(slot: string = this.defaultSlot, signal?: AbortSignal): Promise<boolean> {
    if (signal?.aborted) return false;
    if (this.processing) throw new Error('Save operation already in progress');
    const generation = ++this.restoreGeneration;
    const raw = await this.adapter.read(slot);
    if (!raw || signal?.aborted || generation !== this.restoreGeneration) return false;
    return this.hydrateBlob(raw, slot);
  }

  async list(): Promise<string[]> { return this.adapter.list(); }
  async remove(slot: string = this.defaultSlot): Promise<void> {
    return this.enqueueMutation(slot, () => this.adapter.remove(slot));
  }

  private enqueueMutation(slot: string, operation: () => Promise<void>): Promise<void> {
    const task = (this.pendingMutations.get(slot) ?? Promise.resolve()).then(operation);
    const release = (): void => {
      if (this.pendingMutations.get(slot) === settled) this.pendingMutations.delete(slot);
    };
    const settled = task.then(release, release);
    this.pendingMutations.set(slot, settled);
    return task;
  }

  private process<T>(operation: () => T): T {
    if (this.processing) throw new Error('Save operation already in progress');
    this.processing = true;
    try {
      return operation();
    } finally {
      this.processing = false;
    }
  }

  private reportDiagnostic(diagnostic: SaveDiagnostic): void {
    for (const listener of this.diagnosticListeners) {
      try {
        listener(diagnostic);
      } catch (error) {
        logger.error('Save diagnostic listener failed', error instanceof Error ? error : String(error));
      }
    }
  }
}

function validateSaveEnvelope(blob: SaveBlob): void {
  if (!blob || typeof blob !== 'object' || Array.isArray(blob)
    || !Number.isFinite(blob.savedAt) || blob.savedAt < 0
    || !blob.domains || typeof blob.domains !== 'object' || Array.isArray(blob.domains)) {
    throw new TypeError('Invalid save data envelope');
  }
}

export class DuplicateSaveDomainBindingError extends Error {
  constructor(key: string) {
    super(`Save domain "${key}" is already registered.`);
    this.name = 'DuplicateSaveDomainBindingError';
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
