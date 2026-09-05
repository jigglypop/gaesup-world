import { useEffect, useRef } from 'react';

import { logger } from '../../utils/logger';
import { getSaveSystem } from '../core/SaveSystem';
import type { SaveSystem } from '../core/SaveSystem';

export type AutoSaveOptions = {
  enabled?: boolean;
  intervalMs?: number;
  slot?: string;
  saveOnUnload?: boolean;
  saveOnVisibilityChange?: boolean;
  saveSystem?: SaveSystem;
};

export function useAutoSave({
  enabled = true,
  intervalMs = 5 * 60 * 1000,
  slot,
  saveOnUnload = true,
  saveOnVisibilityChange = true,
  saveSystem,
}: AutoSaveOptions = {}): void {
  useEffect(() => {
    if (!enabled) return;
    const sys = saveSystem ?? getSaveSystem();
    let cancelled = false;

    const doSave = () => {
      if (cancelled) return;
      void sys.save(slot).catch((error: unknown) => {
        logger.error('Automatic save failed', error instanceof Error ? error : String(error));
      });
    };

    const timer = window.setInterval(doSave, Math.max(1000, intervalMs));

    const onUnload = doSave;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') doSave();
    };

    if (saveOnUnload) window.addEventListener('beforeunload', onUnload);
    if (saveOnVisibilityChange) document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (saveOnUnload) window.removeEventListener('beforeunload', onUnload);
      if (saveOnVisibilityChange) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs, slot, saveOnUnload, saveOnVisibilityChange, saveSystem]);
}

export function useLoadOnMount(
  slot?: string,
  onLoaded?: (loaded: boolean) => void,
  saveSystem?: SaveSystem,
): void {
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    const sys = saveSystem ?? getSaveSystem();
    const controller = new AbortController();
    void sys
      .load(slot, controller.signal)
      .then((ok) => {
        if (!controller.signal.aborted) onLoadedRef.current?.(ok);
      })
      .catch((error: unknown) => {
        logger.error('Initial save load failed', error instanceof Error ? error : String(error));
      });
    return () => {
      controller.abort();
    };
  }, [slot, saveSystem]);
}
