import { useEffect } from 'react';

import { useInventoryStoreApi } from '../../inventory/stores/inventoryStore';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { useQuestStoreApi } from '../stores/questStore';
import { acquireQuestObjectiveTracker } from '../stores/tracker';

export function useQuestObjectiveTracker(enabled: boolean = true): void {
  const runtime = useGaesupRuntime(); const revision = useGaesupRuntimeRevision();
  const inventoryStore = useInventoryStoreApi();
  const questStore = useQuestStoreApi();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    return acquireQuestObjectiveTracker(inventoryStore, questStore, { active: () => !runtime || (runtime.isActive() && !runtime.save.isRestoring()) });
  }, [enabled, inventoryStore, questStore, runtime, revision]);
}
