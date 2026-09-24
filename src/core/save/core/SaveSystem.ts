import { clonePlainData } from '../../utils/clone';
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
  SaveOptions,
  SaveRestoreGuard,
  SaveSystemOptions,
} from '../types';

type DomainRevisions = Map<string, number>;

export class SaveSystem {
  private adapter: SaveAdapter;
  private bindings = new Map<string, DomainBinding>();
  private currentVersion: number;
  private migrations: Record<number, Migration>;
  private defaultSlot: string;
  private diagnosticListeners = new Set<SaveDiagnosticListener>();
  private restoreGuards = new Set<SaveRestoreGuard>();
  private processing = false;
  private restoring = false;
  private restoreGeneration = 0;
  private loading: { generation: number; signal: AbortSignal | undefined } | undefined;
  private pendingMutations = new Map<string, Promise<void>>();
  // Revisions of each slot's last skipUnchanged write, valid only for the binding generation that wrote it.
  private savedRevisions = new Map<string, DomainRevisions>();
  private bindingGeneration = 0;

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
      ...(binding.owned ? { owned: true } : {}),
      ...(binding.revision ? { revision: () => binding.revision!() } : {}),
    };
    this.bindings.set(binding.key, normalizedBinding);
    this.bindingsChanged();
    return () => {
      if (this.bindings.get(binding.key) === normalizedBinding) {
        if (this.processing) throw new Error('Save operation already in progress');
        this.bindings.delete(binding.key);
        this.bindingsChanged();
      }
    };
  }

  private bindingsChanged(): void {
    this.cancelPendingLoads();
    // A replaced binding may restart its revision count, so no earlier write proves a slot current.
    this.bindingGeneration++;
    this.savedRevisions.clear();
  }

  has(key: string): boolean { return this.bindings.has(key); }

  getDefaultSlot(): string { return this.defaultSlot; }

  /** Own an effect boundary through validated application and rollback, never storage I/O. */
  registerRestoreGuard(guard: SaveRestoreGuard): () => void {
    if (this.processing) throw new Error('Save operation already in progress');
    // Each registration owns its cleanup even when callers share the same function.
    const owned = () => guard();
    this.restoreGuards.add(owned);
    return () => {
      if (!this.restoreGuards.has(owned)) return;
      // Owners may unmount during hydration. Already entered guards still release once.
      this.restoreGuards.delete(owned);
    };
  }

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
        const value = b.serialize();
        domains[key] = b.owned ? value : clonePlainData(value);
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
  /** True while the current, non-aborted load is waiting for storage. */
  isLoading(): boolean {
    return this.loading !== undefined
      && this.loading.generation === this.restoreGeneration && !this.loading.signal?.aborted;
  }

  private restoreBlob(raw: SaveBlob, slot: string, signal?: AbortSignal): boolean {
    return this.process(() => {
      const generation = ++this.restoreGeneration;
      const releases: Array<() => void> = [];
      const errors: unknown[] = [];
      let result = false;
      this.restoring = true;
      try { result = this.applyBlob(raw, slot, () => !signal?.aborted && generation === this.restoreGeneration, releases); }
      catch (error) { errors.push(error); }
      finally {
        this.restoring = false;
        for (const release of releases.reverse()) {
          try { release(); }
          catch (error) { errors.push(error); this.reportDiagnostic({ phase: 'hydrate', key: '$restore-effects', slot, error }); }
        }
      }
      if (errors.length === 1) throw errors[0];
      if (errors.length > 1) throw new AggregateError(errors, 'Save restoration or effect cleanup failed');
      return result;
    });
  }

  private applyBlob(raw: SaveBlob, slot: string, current: () => boolean, releases: Array<() => void>): boolean {
    let blob = clonePlainData(raw);
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
    const applications: Array<{ key: string; binding: DomainBinding; apply: () => void }> = [];
    for (const [key, binding] of this.bindings) {
      try {
        const data = blob.domains[key];
        applications.push({ key, binding, apply: binding.prepareHydrate
          ? binding.prepareHydrate(data)
          : () => binding.hydrate(data) });
      } catch (error) {
        errors.push(error);
        this.reportDiagnostic({ phase: 'hydrate', key, slot, error });
      }
    }
    if (errors.length > 0) throw new AggregateError(errors, 'Save hydration failed');
    if (!current()) return false;
    // Capture rollback state only once every domain validated, still before any apply or guard.
    // Serializers may return live objects.
    const snapshot = this.serializeBlob(slot);
    for (const guard of this.restoreGuards) {
      if (!current()) return false;
      try {
        const release = guard();
        if (release !== undefined && typeof release !== 'function') throw new TypeError('Restore guards must return a synchronous release function or undefined');
        if (release) releases.push(release);
      }
      catch (error) { this.reportDiagnostic({ phase: 'hydrate', key: '$restore-effects', slot, error }); throw error; }
    }
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
            application.binding.hydrate(snapshot.domains[application.key]);
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

  async save(slot: string = this.defaultSlot, options: SaveOptions = {}): Promise<void> {
    const generation = this.bindingGeneration;
    let revisions: DomainRevisions | undefined;
    const blob = this.process(() => {
      if (options.skipUnchanged) {
        // Read before serializing, so a change made during serialization reads as dirty next time.
        revisions = this.readRevisions();
        if (revisions && sameRevisions(revisions, this.savedRevisions.get(slot))) return undefined;
      }
      return this.serializeBlob(slot);
    });
    if (!blob) return;
    await this.enqueueMutation(slot, async () => {
      await this.adapter.write(slot, blob);
      if (revisions && generation === this.bindingGeneration) this.savedRevisions.set(slot, revisions);
    });
  }

  /** Undefined while any domain cannot report a revision; such saves always write. */
  private readRevisions(): DomainRevisions | undefined {
    const revisions: DomainRevisions = new Map();
    for (const [key, binding] of this.bindings) {
      if (!binding.revision) return undefined;
      revisions.set(key, binding.revision());
    }
    return revisions;
  }

  /** An aborted or superseded load returns false without applying the stored domains. */
  async load(slot: string = this.defaultSlot, signal?: AbortSignal): Promise<boolean> {
    if (signal?.aborted) return false;
    if (this.processing) throw new Error('Save operation already in progress');
    const generation = ++this.restoreGeneration;
    const loading = { generation, signal };
    this.loading = loading;
    try {
      // Observe writes/removals queued before this load for the same slot.
      const mutation = this.pendingMutations.get(slot);
      if (mutation) await mutation;
      if (signal?.aborted || generation !== this.restoreGeneration) return false;
      let raw: SaveBlob | null;
      try { raw = await this.adapter.read(slot); }
      catch (error) { if (signal?.aborted || generation !== this.restoreGeneration) return false; throw error; }
      if (!raw || signal?.aborted || generation !== this.restoreGeneration) return false;
      return this.restoreBlob(raw, slot, signal);
    } finally {
      if (this.loading === loading) this.loading = undefined;
    }
  }

  async list(): Promise<string[]> { return this.adapter.list(); }
  async remove(slot: string = this.defaultSlot): Promise<void> {
    // Later autosaves write the slot again, including ones queued behind this removal.
    this.savedRevisions.delete(slot);
    return this.enqueueMutation(slot, () => {
      this.savedRevisions.delete(slot);
      return this.adapter.remove(slot);
    });
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

function sameRevisions(current: DomainRevisions, saved: DomainRevisions | undefined): boolean {
  if (!saved || saved.size !== current.size) return false;
  for (const [key, revision] of current) {
    if (saved.get(key) !== revision) return false;
  }
  return true;
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
