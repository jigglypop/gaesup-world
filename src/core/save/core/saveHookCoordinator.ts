import { isAutoSaveSuspended } from './autoSaveSuspension';
import type { SaveSystem } from './SaveSystem';
import { logger } from '../../utils/logger';


type AutoSaveOwner = {
  intervalMs: number;
  saveOnUnload: boolean;
  saveOnVisibilityChange: boolean;
};
type LoadOwner = { notify: (loaded: boolean) => void; delivered: boolean };
type InitialLoad = {
  controller: AbortController;
  owners: Set<LoadOwner>;
  state: 'pending' | 'loaded' | 'failed';
  result: boolean;
};

const coordinators = new WeakMap<SaveSystem, Map<string, SaveHookCoordinator>>();

/** Shared only while consumers own the same system and canonical slot. */
function getCoordinator(system: SaveSystem, slot: string | undefined): SaveHookCoordinator {
  let slots = coordinators.get(system);
  if (!slots) {
    slots = new Map();
    coordinators.set(system, slots);
  }
  const key = slot ?? system.getDefaultSlot();
  let coordinator = slots.get(key);
  if (!coordinator) {
    coordinator = new SaveHookCoordinator(system, key, slots);
    slots.set(key, coordinator);
  }
  return coordinator;
}

export function acquireAutoSave(system: SaveSystem, slot: string | undefined, options: AutoSaveOwner): () => void {
  return getCoordinator(system, slot).acquireAutoSave(options);
}

export function acquireInitialLoad(system: SaveSystem, slot: string | undefined, notify: (loaded: boolean) => void): () => void {
  return getCoordinator(system, slot).acquireInitialLoad(notify);
}

class SaveHookCoordinator {
  private autoOwners = new Set<AutoSaveOwner>();
  private initialLoad: InitialLoad | undefined;
  private timer: number | undefined;
  private intervalMs: number | undefined;
  private unload = false;
  private visibility = false;
  private saving = false;
  private pendingSave = false;

  constructor(private system: SaveSystem, private slot: string, private slots: Map<string, SaveHookCoordinator>) {}

  acquireAutoSave(options: AutoSaveOwner): () => void {
    const owner = {
      ...options,
      intervalMs: Number.isFinite(options.intervalMs) ? Math.max(1000, options.intervalMs) : 5 * 60 * 1000,
    };
    this.autoOwners.add(owner);
    this.syncResources();
    return () => {
      this.autoOwners.delete(owner);
      if (this.autoOwners.size === 0) this.pendingSave = false;
      this.syncResources();
      this.prune();
    };
  }

  acquireInitialLoad(notify: (loaded: boolean) => void): () => void {
    const owner: LoadOwner = { notify, delivered: false };
    let load = this.initialLoad;
    if (!load) {
      load = { controller: new AbortController(), owners: new Set([owner]), state: 'pending', result: false };
      this.initialLoad = load;
      this.startLoad(load);
    } else {
      load.owners.add(owner);
      const current = load;
      // A late consumer receives the result without reapplying storage over live edits.
      void Promise.resolve().then(() => this.notifyLoaded(current, owner));
    }
    const current = load;
    return () => {
      current.owners.delete(owner);
      if (current.owners.size === 0 && this.initialLoad === current) {
        current.controller.abort();
        this.initialLoad = undefined;
        this.prune();
      }
    };
  }

  private startLoad(load: InitialLoad): void {
    void this.system.load(this.slot, load.controller.signal).then(result => {
      if (this.initialLoad !== load || load.controller.signal.aborted) return;
      load.state = 'loaded';
      load.result = result;
      for (const owner of [...load.owners]) this.notifyLoaded(load, owner);
    }).catch((error: unknown) => {
      if (this.initialLoad !== load || load.controller.signal.aborted) return;
      // Keep autosave suspended after a read/restore failure until these owners leave.
      load.state = 'failed';
      logger.error('Initial save load failed', error instanceof Error ? error : String(error));
    });
  }

  private notifyLoaded(load: InitialLoad, owner: LoadOwner): void {
    if (this.initialLoad !== load || load.state !== 'loaded' || !load.owners.has(owner) || owner.delivered) return;
    owner.delivered = true;
    try { owner.notify(load.result); }
    catch (error) { logger.error('Initial save callback failed', error instanceof Error ? error : String(error)); }
  }

  private canSave(): boolean {
    return this.autoOwners.size > 0 && !isAutoSaveSuspended() && !this.system.isLoading() && !this.system.isRestoring()
      && (!this.initialLoad || this.initialLoad.state === 'loaded');
  }

  private requestSave = (): void => {
    if (!this.canSave()) return;
    if (this.saving) { this.pendingSave = true; return; }
    // Claim before serialization, which can itself trigger subscriber callbacks.
    this.saving = true;
    // Unchanged domains make every trigger, including beforeunload, a no-op after the hidden-page save.
    void this.system.save(this.slot, { skipUnchanged: true }).catch((error: unknown) => {
      logger.error('Automatic save failed', error instanceof Error ? error : String(error));
    }).finally(() => {
      this.saving = false;
      const pending = this.pendingSave;
      this.pendingSave = false;
      if (pending) this.requestSave();
      this.prune();
    });
  };

  private onVisibility = (): void => {
    if (document.visibilityState === 'hidden') this.requestSave();
  };

  private syncResources(): void {
    let intervalMs: number | undefined;
    let unload = false;
    let visibility = false;
    for (const owner of this.autoOwners) {
      intervalMs = Math.min(intervalMs ?? Infinity, owner.intervalMs);
      unload ||= owner.saveOnUnload;
      visibility ||= owner.saveOnVisibilityChange;
    }
    if (intervalMs !== this.intervalMs) {
      if (this.timer !== undefined) window.clearInterval(this.timer);
      this.timer = intervalMs === undefined ? undefined : window.setInterval(this.requestSave, intervalMs);
      this.intervalMs = intervalMs;
    }
    if (unload !== this.unload) {
      if (unload) window.addEventListener('beforeunload', this.requestSave);
      else window.removeEventListener('beforeunload', this.requestSave);
      this.unload = unload;
    }
    if (visibility !== this.visibility) {
      if (visibility) document.addEventListener('visibilitychange', this.onVisibility);
      else document.removeEventListener('visibilitychange', this.onVisibility);
      this.visibility = visibility;
    }
  }

  private prune(): void {
    // Retain in-flight ownership so a remount cannot start a second write loop.
    if (!this.autoOwners.size && !this.initialLoad && !this.saving && this.slots.get(this.slot) === this) {
      this.slots.delete(this.slot);
    }
  }
}
