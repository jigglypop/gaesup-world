import { logger } from '../../utils/logger';
import { IndexedDBAdapter } from '../adapters/IndexedDBAdapter';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';
import { NamespacedSaveAdapter } from '../adapters/NamespacedSaveAdapter';
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
  private restoring = false;
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
    if (this.processing) throw new Error('Save operation already in progress');
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
    this.cancelPendingLoads();
    return () => {
      if (this.bindings.get(binding.key) === normalizedBinding) {
        if (this.processing) throw new Error('Save operation already in progress');
        this.bindings.delete(binding.key);
        this.cancelPendingLoads();
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
        domains[key] = cloneDomain(b.serialize());
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
    return this.restoreBlob(raw, slot);
  }

  /** Invalidates reads from an old world/binding generation without canceling queued writes. */
  cancelPendingLoads(): void { this.restoreGeneration++; }
  /** True through preparation, application and rollback; observers should not interpret these writes as play. */
  isRestoring(): boolean { return this.restoring; }

  private restoreBlob(raw: SaveBlob, slot: string, signal?: AbortSignal): boolean {
    return this.process(() => {
      const generation = ++this.restoreGeneration;
      this.restoring = true;
      try { return this.applyBlob(raw, slot, () => !signal?.aborted && generation === this.restoreGeneration); }
      finally { this.restoring = false; }
    });
  }

  private applyBlob(raw: SaveBlob, slot: string, current: () => boolean): boolean {
    let blob = cloneDomain(raw);
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
    if (!current()) return false;
    const errors: unknown[] = [];
    // Capture every domain before validation/application. Serializers may return live objects.
    const snapshot = this.serializeBlob(slot);
    const applications: Array<{ key: string; apply: () => void; rollback: () => void }> = [];
    for (const [key, binding] of this.bindings) {
      try {
        const data = blob.domains[key];
        applications.push({ key, apply: binding.prepareHydrate
          ? binding.prepareHydrate(data)
          : () => binding.hydrate(data), rollback: () => binding.hydrate(snapshot.domains[key]) });
      } catch (error) {
        errors.push(error);
        this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, 'Save hydration failed');
    let applied = -1;
    for (let index = 0; index < applications.length; index++) {
      const { key, apply } = applications[index]!;
      try {
        if (!current()) throw new RestoreCancelledError();
        applied = index;
        apply();
        if (!current()) throw new RestoreCancelledError();
      } catch (error) {
        errors.push(error);
        if (!(error instanceof RestoreCancelledError)) this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
        // Include the failing domain: it may have mutated before throwing.
        for (let previous = applied; previous >= 0; previous--) {
          const application = applications[previous]!;
          try {
            application.rollback();
          } catch (rollbackError) {
            errors.push(rollbackError);
            this.reportDiagnostic({ phase: 'hydrate', operation: 'rollback', key: application.key, slot, error: rollbackError });
          }
        }
        if (error instanceof RestoreCancelledError && errors.length === 1) return false;
        throw new AggregateError(errors, errors.length > 1
          ? 'Save hydration failed; rollback incomplete'
          : 'Save hydration failed; previous state restored');
      }
    }
    return current();
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
    // Observe writes/removals queued before this load for the same slot.
    const mutation = this.pendingMutations.get(slot);
    if (mutation) await mutation;
    if (signal?.aborted || generation !== this.restoreGeneration) return false;
    let raw: SaveBlob | null;
    try { raw = await this.adapter.read(slot); }
    catch (error) { if (signal?.aborted || generation !== this.restoreGeneration) return false; throw error; }
    if (!raw || signal?.aborted || generation !== this.restoreGeneration) return false;
    return this.restoreBlob(raw, slot, signal);
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

class RestoreCancelledError extends Error { constructor() { super('Save restoration was cancelled'); } }

function cloneDomain<T>(value: T): T {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  // Legacy environments use the same JSON value contract as LocalStorageAdapter.
  return JSON.parse(JSON.stringify(value)) as T;
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

export function createDefaultSaveSystem(options: { namespace?: string } = {}): SaveSystem {
  const adapter: SaveAdapter = (typeof indexedDB !== 'undefined')
    ? new IndexedDBAdapter()
    : new LocalStorageAdapter();
  return new SaveSystem({ adapter: options.namespace === undefined ? adapter : new NamespacedSaveAdapter(adapter, options.namespace), defaultSlot: 'main', currentVersion: 1 });
}

export function getSaveSystem(): SaveSystem {
  if (!_instance) _instance = createDefaultSaveSystem();
  return _instance;
}
