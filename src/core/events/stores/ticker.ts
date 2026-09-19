import type { EventsStore } from './eventsStore';
import { createSharedObserver } from '../../stores/sharedObserver';
import type { TimeStore } from '../../time/stores/timeStore';

export const acquireEventsTicker = createSharedObserver<TimeStore, EventsStore, { started: string[]; ended: string[] }>((time, events, { active, emit }) => {
  const apply = () => { if (active()) { const change = events.getState().refresh(time.getState().time); if (change.started.length || change.ended.length) emit(change); } };
  const off = time.subscribe((state, previous) => {
    if (state.hydrationRevision !== previous.hydrationRevision) return;
    if (state.time.day !== previous.time.day || state.time.month !== previous.time.month || state.time.season !== previous.time.season || state.time.weekday !== previous.time.weekday) apply();
  });
  try { apply(); return off; } catch (error) { off(); throw error; }
});
