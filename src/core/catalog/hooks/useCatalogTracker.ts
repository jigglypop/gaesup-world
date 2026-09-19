import { useEffect } from 'react';

import { useInventoryStoreApi } from '../../inventory/stores/inventoryStore';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { useCatalogStoreApi } from '../stores/catalogStore';
import { acquireCatalogTracker } from '../stores/tracker';

export function useCatalogTracker(enabled: boolean = true): void {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const catalogStore = useCatalogStoreApi();
  const inventoryStore = useInventoryStoreApi();
  const timeStore = useTimeStoreApi();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    return acquireCatalogTracker(inventoryStore, catalogStore, timeStore, () => !runtime || (runtime.isActive() && !runtime.save.isRestoring()));
  }, [enabled, timeStore, inventoryStore, catalogStore, runtime, revision]);
}
