import { useEffect, useLayoutEffect, useRef } from 'react';

import { useGaesupRuntime } from '../../runtime/runtimeContext';
import type { GaesupRuntime } from '../../runtime/types';
import { acquireAutoSave, acquireInitialLoad } from '../core/saveHookCoordinator';
import { getSaveSystem } from '../core/SaveSystem';
import type { SaveSystem } from '../core/SaveSystem';

export type AutoSaveOptions = {
  enabled?: boolean;
  intervalMs?: number;
  slot?: string;
  saveOnUnload?: boolean;
  saveOnVisibilityChange?: boolean;
  /** Overrides the nearest world's system; without a Provider, uses the legacy default. */
  saveSystem?: SaveSystem;
};

/** Shares a writer per system/slot. The shortest active interval wins; pending writes coalesce. */
export function useAutoSave({
  enabled = true,
  intervalMs = 5 * 60 * 1000,
  slot,
  saveOnUnload = true,
  saveOnVisibilityChange = true,
  saveSystem,
}: AutoSaveOptions = {}): void {
  const runtime = useGaesupRuntime();
  const system = saveSystem ?? runtime?.save ?? getSaveSystem();
  useEffect(() => {
    if (!enabled) return;
    return ownRuntimeLease(runtime, () => acquireAutoSave(system, slot, { intervalMs, saveOnUnload, saveOnVisibilityChange }));
  }, [enabled, intervalMs, slot, saveOnUnload, saveOnVisibilityChange, system, runtime]);
}

/** Shares an initial read while consumers remain mounted; late consumers receive its cached result. */
export function useLoadOnMount(
  slot?: string,
  onLoaded?: (loaded: boolean) => void,
  saveSystem?: SaveSystem,
): void {
  const runtime = useGaesupRuntime();
  const system = saveSystem ?? runtime?.save ?? getSaveSystem();
  const onLoadedRef = useRef(onLoaded);
  useLayoutEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    return ownRuntimeLease(runtime, () => acquireInitialLoad(system, slot, ok => onLoadedRef.current?.(ok)));
  }, [slot, system, runtime]);
}

/** Release synchronously with the world, even before React flushes the Provider update. */
function ownRuntimeLease(runtime: GaesupRuntime | null, acquire: () => () => void): () => void {
  let release: (() => void) | undefined;
  const sync = (): void => {
    if (!runtime || runtime.isActive()) release ??= acquire();
    else { release?.(); release = undefined; }
  };
  const unsubscribe = runtime?.subscribeLifecycle(sync);
  sync();
  return () => { unsubscribe?.(); release?.(); release = undefined; };
}
