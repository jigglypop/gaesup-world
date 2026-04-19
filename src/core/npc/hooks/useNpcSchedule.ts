import { useEffect, useState } from 'react';

import { useTimeStore } from '../../time/stores/timeStore';
import { getNPCScheduler, type ActiveSlot } from '../core/NPCScheduler';

export function useNpcSchedule(npcId: string): ActiveSlot | null {
  const [slot, setSlot] = useState<ActiveSlot | null>(() => {
    const s = useTimeStore.getState();
    return getNPCScheduler().resolve(npcId, s.time);
  });

  useEffect(() => {
    let lastHour = -1;
    const apply = () => {
      const s = useTimeStore.getState();
      if (s.time.hour === lastHour) return;
      lastHour = s.time.hour;
      const next = getNPCScheduler().resolve(npcId, s.time);
      setSlot(next);
    };
    apply();
    const off = useTimeStore.subscribe((state, prev) => {
      if (
        state.time.hour !== prev.time.hour ||
        state.time.day !== prev.time.day ||
        state.time.weekday !== prev.time.weekday
      ) {
        apply();
      }
    });
    return off;
  }, [npcId]);

  return slot;
}
