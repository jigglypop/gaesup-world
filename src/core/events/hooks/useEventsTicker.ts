import { useEffect, useLayoutEffect, useRef } from 'react';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { useEventsStoreApi } from '../stores/eventsStore';
import { acquireEventsTicker } from '../stores/ticker';

export type EventsTickerOptions = {
  onStarted?: (ids: string[]) => void;
  onEnded?: (ids: string[]) => void;
};

export function useEventsTicker(enabled: boolean = true, opts: EventsTickerOptions = {}): void {
  const runtime = useGaesupRuntime(); const revision = useGaesupRuntimeRevision();
  const callbacks = useRef(opts); useLayoutEffect(() => { callbacks.current = opts; }, [opts]);
  const eventsStore = useEventsStoreApi();
  const timeStore = useTimeStoreApi();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    return acquireEventsTicker(timeStore, eventsStore, {
      active: () => !runtime || (runtime.isActive() && !runtime.save.isRestoring()),
      notify: ({ started, ended }) => {
        if (started.length) callbacks.current.onStarted?.([...started]);
        if (ended.length && (!runtime || (runtime.isActive() && !runtime.save.isRestoring()))) callbacks.current.onEnded?.([...ended]);
      },
    });
  }, [enabled, timeStore, eventsStore, runtime, revision]);
}
