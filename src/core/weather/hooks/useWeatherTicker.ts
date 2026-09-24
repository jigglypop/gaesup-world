import { useEffect } from 'react';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { acquireWeatherTicker } from '../stores/ticker';
import { useWeatherStoreApi } from '../stores/weatherStore';

export function useWeatherTicker(enabled: boolean = true): void {
  const runtime = useGaesupRuntime(); const revision = useGaesupRuntimeRevision();
  const weatherStore = useWeatherStoreApi();
  const timeStore = useTimeStoreApi();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    return acquireWeatherTicker(timeStore, weatherStore, { active: () => !runtime || (runtime.isActive() && !runtime.save.isRestoring()) });
  }, [enabled, timeStore, weatherStore, runtime, revision]);
}
