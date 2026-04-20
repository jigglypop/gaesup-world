import { useEffect } from 'react';

import { useTimeStore } from '../../time/stores/timeStore';
import { useEventsStore } from '../stores/eventsStore';

export type EventsTickerOptions = {
  onStarted?: (ids: string[]) => void;
  onEnded?: (ids: string[]) => void;
};

export function useEventsTicker(enabled: boolean = true, opts: EventsTickerOptions = {}): void {
  useEffect(() => {
    if (!enabled) return;
    const apply = () => {
      const t = useTimeStore.getState().time;
      const { started, ended } = useEventsStore.getState().refresh(t);
      if (started.length && opts.onStarted) opts.onStarted(started);
      if (ended.length && opts.onEnded) opts.onEnded(ended);
    };
    apply();
    const off = useTimeStore.subscribe((state, prev) => {
      if (
        state.time.day !== prev.time.day ||
        state.time.month !== prev.time.month ||
        state.time.season !== prev.time.season ||
        state.time.weekday !== prev.time.weekday
      ) {
        apply();
      }
    });
    return off;
  }, [enabled, opts.onStarted, opts.onEnded]);
}
