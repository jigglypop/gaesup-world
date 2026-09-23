import { useEffect, useState } from 'react';

import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { getNPCScheduler, type ActiveSlot } from '../core/NPCScheduler';

export function useNpcSchedule(npcId: string): ActiveSlot | null {
  const timeStore = useTimeStoreApi();
  const scheduler = useGaesupRuntime()?.npcScheduler ?? getNPCScheduler();
  const [slot, setSlot] = useState<ActiveSlot | null>(() => {
    const s = timeStore.getState();
    return scheduler.resolve(npcId, s.time);
  });

  useEffect(() => {
    const apply = () => {
      const s = timeStore.getState();
      const next = scheduler.resolve(npcId, s.time);
      setSlot(next);
    };
    apply();
    const off = timeStore.subscribe((state, prev) => {
      if (
        state.time.hour !== prev.time.hour ||
        state.time.day !== prev.time.day ||
        state.time.season !== prev.time.season ||
        state.time.weekday !== prev.time.weekday
      ) {
        apply();
      }
    });
    const offScheduler = scheduler.subscribe(apply);
    return () => { off(); offScheduler(); };
  }, [npcId, timeStore, scheduler]);

  return slot;
}
