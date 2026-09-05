import { usePlotStore } from './plotStore';
import { useTimeStore } from '../../time/stores/timeStore';

let owners = 0;
let unsubscribe: (() => void) | null = null;

export function acquireFarmingClock(): () => void {
  if (!unsubscribe) {
    usePlotStore.getState().tick(useTimeStore.getState().totalMinutes);
    unsubscribe = useTimeStore.subscribe((state, previous) => {
      if (state.totalMinutes !== previous.totalMinutes) usePlotStore.getState().tick(state.totalMinutes);
    });
  }
  owners++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--owners === 0) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };
}
