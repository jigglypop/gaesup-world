import { AnimationClockLoop } from '../../simulation/AnimationClockLoop';
import { FixedStepClock } from '../../simulation/FixedStepClock';
import type { ErrorReporter } from '../../utils/reportError';

/** Minimal simulation port; the clock does not depend on React or the store implementation. */
export type TimeClockStore = { getState: () => { tick: (realDeltaMs: number) => void } };
const clocks = new WeakMap<TimeClockStore, AnimationClockLoop>();
export const RUNTIME_TIME_STORE_SERVICE_ID = 'gaesup.runtime.time-store';

/** `report` applies when this store's clock is first created; a runtime creates its own right after its store. */
export function getTimeClock(store: TimeClockStore, report?: ErrorReporter): AnimationClockLoop {
  let loop = clocks.get(store);
  if (!loop) {
    const clock = new FixedStepClock(report ? { report } : {});
    clock.addSystem({ id: 'time', phase: 'simulation', update: tick => store.getState().tick(tick.deltaSeconds * 1000) });
    loop = new AnimationClockLoop(clock);
    clocks.set(store, loop);
  }
  return loop;
}
