import { useEffect } from 'react';

import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { useQuestStore } from '../stores/questStore';

export function useQuestObjectiveTracker(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const off = useInventoryStore.subscribe((state, prev) => {
      if (state.slots === prev.slots) return;
      const active = useQuestStore.getState().active();
      for (const p of active) useQuestStore.getState().recheck(p.questId);
    });
    return off;
  }, [enabled]);
}
