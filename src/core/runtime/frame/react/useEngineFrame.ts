import { useEffect, useRef } from 'react';

import type { FrameCallback, FrameDriver, FramePhase } from '../types';
import { retainImplicitFrameHost, useCanvasFrameScheduler, useFrameRegistrationEffect, useRootStore } from './canvasScheduler';
import type { UseEngineFrameOptions } from './types';

export function useEngineFrame(
  phase: FramePhase,
  callback: FrameCallback,
  options: UseEngineFrameOptions = {},
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const enabledRef = useRef(options.enabled);
  enabledRef.current = options.enabled;
  const canvasScheduler = useCanvasFrameScheduler();
  const canvasStore = useRootStore();
  const { scheduler = canvasScheduler, active = true, order, throttleMs, label } = options;

  useFrameRegistrationEffect(() => {
    if (!active) return undefined;
    const unsubscribe = scheduler.add(
      phase,
      (delta, elapsedMs) => {
        const enabled = enabledRef.current;
        if (enabled && !enabled()) return;
        callbackRef.current(delta, elapsedMs);
      },
      {
        ...(order !== undefined ? { order } : {}),
        ...(throttleMs !== undefined ? { throttleMs } : {}),
        ...(label !== undefined ? { label } : {}),
      },
    );
    const releaseHost = scheduler === canvasScheduler ? retainImplicitFrameHost(scheduler, canvasStore) : undefined;
    return () => {
      releaseHost?.();
      unsubscribe();
    };
  }, [active, canvasScheduler, canvasStore, label, order, phase, scheduler, throttleMs]);
}

export function useFrameDriverItem<T>(driver: FrameDriver<T>, item: T | null): void {
  useEffect(() => {
    if (item === null) return undefined;
    return driver.add(item);
  }, [driver, item]);
}
