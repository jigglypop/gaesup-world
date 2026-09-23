import { useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import { GaesupRuntimeContext } from './runtimeContext';
import type { GaesupRuntime } from './types';
import { GaesupStoreProvider } from '../stores/gaesupStore';
import { TimeStoreProvider } from '../time/stores/timeStore';

export { useGaesupRuntime, useGaesupRuntimeRevision } from './runtimeContext';

export interface GaesupRuntimeProviderProps {
  /** Omission inherits the parent world; null explicitly selects the legacy default scope. */
  runtime?: GaesupRuntime | null | undefined;
  revision?: number | undefined;
  children?: ReactNode;
}

const noLifecycleSubscription = () => () => {};
const noLifecycleRevision = () => 0;

export function GaesupRuntimeProvider({
  runtime: providedRuntime,
  revision: providedRevision,
  children,
}: GaesupRuntimeProviderProps) {
  const parent = useContext(GaesupRuntimeContext);
  const runtime = providedRuntime === undefined ? parent.runtime : providedRuntime;
  const ownRevision = useSyncExternalStore(
    runtime?.subscribeLifecycle ?? noLifecycleSubscription,
    runtime?.getLifecycleRevision ?? noLifecycleRevision,
    runtime?.getLifecycleRevision ?? noLifecycleRevision,
  );
  const revision =
    providedRevision !== undefined
      ? providedRevision + ownRevision
      : providedRuntime === undefined
        ? parent.revision
        : ownRevision;
  const value = useMemo(() => ({ runtime, revision }), [runtime, revision]);
  return (
    <GaesupRuntimeContext.Provider value={value}>
      <GaesupStoreProvider value={runtime?.store ?? null}>
        <TimeStoreProvider value={runtime?.timeStore ?? null}>{children}</TimeStoreProvider>
      </GaesupStoreProvider>
    </GaesupRuntimeContext.Provider>
  );
}
