import { useEffect } from 'react';

import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { getTimeClock } from '../../time/core/timeClock';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { findNPCSimulation, NPCSimulation } from '../core/NPCSimulation';
import { useNPCStoreApi } from '../stores/npcStore';

export function useNPCSimulation(): NPCSimulation {
  const runtime = useGaesupRuntime();
  const store = useNPCStoreApi();
  const timeStore = useTimeStoreApi();
  const simulation = runtime?.npcSimulation ?? findNPCSimulation(store) ?? new NPCSimulation(store, getTimeClock(timeStore));
  useEffect(() => {
    if (runtime) return;
    return simulation.acquire();
  }, [runtime, simulation]);
  return simulation;
}
