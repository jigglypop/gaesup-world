import { useEffect, useRef } from 'react';

import { frameScheduler } from '../FrameScheduler';
import type { FrameCallback, FrameDriver, FramePhase } from '../types';
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
  const { scheduler = frameScheduler, active = true, order, throttleMs, label } = options;

  useEffect(() => {
    if (!active) return undefined;
    return scheduler.add(phase, (delta, elapsedMs) => callbackRef.current(delta, elapsedMs), {
      enabled: () => enabledRef.current?.() ?? true,
      ...(order !== undefined ? { order } : {}),
      ...(throttleMs !== undefined ? { throttleMs } : {}),
      ...(label !== undefined ? { label } : {}),
    });
  }, [active, label, order, phase, scheduler, throttleMs]);
}

export function useFrameDriverItem<T>(driver: FrameDriver<T>, item: T | null): void {
  useEffect(() => {
    if (item === null) return undefined;
    return driver.add(item);
  }, [driver, item]);
}
