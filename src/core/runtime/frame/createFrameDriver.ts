import { frameScheduler, type FrameScheduler } from './FrameScheduler';
import type { FrameDriver, FramePhase, FrameSubscriptionOptions } from './types';

export function createFrameDriver<T>(
  phase: FramePhase,
  update: (item: T, delta: number, elapsedMs: number) => void,
  options: FrameSubscriptionOptions = {},
  scheduler: FrameScheduler = frameScheduler,
): FrameDriver<T> {
  const items: T[] = [];
  let unsubscribe: (() => void) | null = null;

  const run = (delta: number, elapsedMs: number) => {
    for (let i = 0; i < items.length; i++) update(items[i]!, delta, elapsedMs);
  };

  const release = () => {
    if (items.length > 0 || !unsubscribe) return;
    unsubscribe();
    unsubscribe = null;
  };

  return {
    add: (item) => {
      items.push(item);
      unsubscribe ??= scheduler.add(phase, run, { label: `driver:${phase}`, ...options });
      let removed = false;
      return () => {
        if (removed) return;
        removed = true;
        const index = items.indexOf(item);
        if (index >= 0) items.splice(index, 1);
        release();
      };
    },
    size: () => items.length,
    dispose: () => {
      items.length = 0;
      release();
    },
  };
}
