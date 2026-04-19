import { useEffect } from 'react';

import { getSaveSystem } from '../core/SaveSystem';

export type AutoSaveOptions = {
  intervalMs?: number;
  slot?: string;
  saveOnUnload?: boolean;
  saveOnVisibilityChange?: boolean;
};

export function useAutoSave({
  intervalMs = 5 * 60 * 1000,
  slot,
  saveOnUnload = true,
  saveOnVisibilityChange = true,
}: AutoSaveOptions = {}): void {
  useEffect(() => {
    const sys = getSaveSystem();
    let cancelled = false;

    const doSave = () => {
      if (cancelled) return;
      void sys.save(slot);
    };

    const timer = window.setInterval(doSave, Math.max(1000, intervalMs));

    const onUnload = () => { void sys.save(slot); };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void sys.save(slot);
    };

    if (saveOnUnload) window.addEventListener('beforeunload', onUnload);
    if (saveOnVisibilityChange) document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (saveOnUnload) window.removeEventListener('beforeunload', onUnload);
      if (saveOnVisibilityChange) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs, slot, saveOnUnload, saveOnVisibilityChange]);
}

export function useLoadOnMount(slot?: string, onLoaded?: (loaded: boolean) => void): void {
  useEffect(() => {
    const sys = getSaveSystem();
    let cancelled = false;
    void sys.load(slot).then((ok) => {
      if (!cancelled && onLoaded) onLoaded(ok);
    });
    return () => { cancelled = true; };
  }, [slot, onLoaded]);
}
