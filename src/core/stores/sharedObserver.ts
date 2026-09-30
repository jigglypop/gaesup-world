import { logger } from '../utils/logger';

type ObserverOwner<T> = { active: () => boolean; notify?: ((value: T) => void) | undefined };
type ObserverControls<T> = { active: () => boolean; emit: (value: T) => void };

/** One store subscription per source/target pair; each mounted consumer keeps its own callback lease. */
export function createSharedObserver<A extends object, B extends object, T = void>(connect: (source: A, target: B, controls: ObserverControls<T>) => () => void) {
  type Entry = { owners: Set<ObserverOwner<T>>; snapshot: ObserverOwner<T>[]; stop?: () => void };
  const sources = new WeakMap<A, WeakMap<B, Entry>>();
  return (source: A, target: B, owner: ObserverOwner<T>): (() => void) => {
    let targets = sources.get(source); if (!targets) { targets = new WeakMap(); sources.set(source, targets); }
    let entry = targets.get(target); const first = !entry;
    if (!entry) { entry = { owners: new Set(), snapshot: [] }; targets.set(target, entry); }
    const owned = entry; const lease = { ...owner }; owned.owners.add(lease); owned.snapshot = [...owned.owners];
    const release = () => {
      if (!owned.owners.delete(lease)) return; owned.snapshot = [...owned.owners];
      if (owned.owners.size) return;
      if (targets!.get(target) === owned) targets!.delete(target);
      const stop = owned.stop; delete owned.stop; stop?.();
    };
    if (first) {
      try {
        let publishing = false; const pending: Array<{ value: T; owners: ObserverOwner<T>[] }> = [];
        const stop = connect(source, target, {
          active: () => owned.snapshot.some(client => client.active()),
          emit: value => {
            pending.push({ value, owners: owned.snapshot }); if (publishing) return; publishing = true;
            try {
              for (let index = 0; index < pending.length; index++) {
                const notification = pending[index]!;
                for (const client of notification.owners) if (owned.owners.has(client) && client.active()) {
                  try { client.notify?.(notification.value); } catch (error) { logger.error('World observer callback failed', error instanceof Error ? error : String(error)); }
                }
              }
            } finally { pending.length = 0; publishing = false; }
          },
        });
        if (owned.owners.size) owned.stop = stop; else stop();
      } catch (error) { if (targets.get(target) === owned) targets.delete(target); owned.owners.clear(); owned.snapshot = []; throw error; }
    }
    return release;
  };
}
