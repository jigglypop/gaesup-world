import { usePlotStore, type PlotStore } from './plotStore';
import { createSharedObserver } from '../../stores/sharedObserver';
import { useTimeStore, type TimeStore } from '../../time/stores/timeStore';

const acquire = createSharedObserver<TimeStore, PlotStore>((time, plots, { active }) => {
  const off = time.subscribe((state, previous) => {
    if (active() && state.hydrationRevision === previous.hydrationRevision && state.totalMinutes !== previous.totalMinutes) plots.getState().tick(state.totalMinutes);
  });
  try { if (active()) plots.getState().tick(time.getState().totalMinutes); return off; }
  catch (error) { off(); throw error; }
});

export function acquireFarmingClock(timeStore: TimeStore = useTimeStore, plotStore: PlotStore = usePlotStore, active: () => boolean = () => true): () => void {
  return acquire(timeStore, plotStore, { active });
}
