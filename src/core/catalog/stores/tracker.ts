import type { CatalogStore } from './catalogStore';
import type { InventoryStore } from '../../inventory/stores/inventoryStore';
import { createSharedObserver } from '../../stores/sharedObserver';
import type { TimeStore } from '../../time/stores/timeStore';

const trackers = new WeakMap<TimeStore, ReturnType<typeof createTracker>>();
function createTracker(time: TimeStore) {
  return createSharedObserver<InventoryStore, CatalogStore>((inventory, catalog, { active }) => inventory.subscribe((state, previous) => {
    if (!active() || state.slots === previous.slots || state.hydrationRevision !== previous.hydrationRevision) return;
    const day = Math.floor(time.getState().totalMinutes / (60 * 24));
    const changes = new Map<string, number>();
    for (const slot of previous.slots) if (slot) changes.set(slot.itemId, (changes.get(slot.itemId) ?? 0) - slot.count);
    for (const slot of state.slots) if (slot) changes.set(slot.itemId, (changes.get(slot.itemId) ?? 0) + slot.count);
    for (const [id, count] of changes) if (count > 0 && active()) catalog.getState().record(id, count, day);
  }));
}

/** Multiple views of the same world share one inventory scan and collection write. */
export function acquireCatalogTracker(inventory: InventoryStore, catalog: CatalogStore, time: TimeStore, active: () => boolean = () => true): () => void {
  let acquire = trackers.get(time); if (!acquire) { acquire = createTracker(time); trackers.set(time, acquire); }
  return acquire(inventory, catalog, { active });
}
