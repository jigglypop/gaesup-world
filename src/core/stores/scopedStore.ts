import { useStore } from 'zustand';

import { lazyStore, selectState, type BoundStore } from './lazyStore';
import { isProductionEnv } from '../utils/env';
import { logger } from '../utils/logger';

/**
 * Keep the public static API while React reads and subscribes to its owning world. The legacy global store behind the
 * static API and the ownerless fallback is created on first use, which development reports once.
 */
export function lazyScopedStore<S extends BoundStore>(
  name: string,
  createLegacy: () => S,
  useOwnedStore: () => S | null | undefined,
) {
  const legacy = lazyStore(() => {
    if (!isProductionEnv()) {
      logger.warn(`[${name}] No runtime owns this store here, so the legacy global store was created. `
        + "Legacy stores are removed in 2.0: render under GaesupRuntimeProvider or use the runtime's store.");
    }
    return createLegacy();
  });
  const useStoreApi = (): S => useOwnedStore() ?? hook;
  function useScoped(selector = selectState) {
    return useStore(useStoreApi(), selector);
  }
  const hook: S = Object.assign(useScoped, legacy);
  return { useStore: hook, useStoreApi };
}
