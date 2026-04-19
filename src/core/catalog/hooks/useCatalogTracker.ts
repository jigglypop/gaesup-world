import { useEffect } from 'react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useTimeStore } from '../../time/stores/timeStore';
import { useCatalogStore } from '../stores/catalogStore';

export function useCatalogTracker(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const off = useInventoryStore.subscribe((state, prev) => {
      if (state.slots === prev.slots) return;
      const day = Math.floor(useTimeStore.getState().totalMinutes / (60 * 24));
      const prevCounts = new Map<string, number>();
      for (const s of prev.slots) if (s) prevCounts.set(s.itemId, (prevCounts.get(s.itemId) ?? 0) + s.count);
      const curCounts = new Map<string, number>();
      for (const s of state.slots) if (s) curCounts.set(s.itemId, (curCounts.get(s.itemId) ?? 0) + s.count);
      for (const [id, count] of curCounts.entries()) {
        const delta = count - (prevCounts.get(id) ?? 0);
        if (delta > 0) useCatalogStore.getState().record(id, delta, day);
      }
    });
    return off;
  }, [enabled]);
}
