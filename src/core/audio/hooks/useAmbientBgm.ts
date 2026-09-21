import { useEffect } from 'react';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import type { SaveSystem } from '../../save/core/SaveSystem';
import { useTimeStoreApi, type TimeStore } from '../../time/stores/timeStore';
import { useWeatherStoreApi, type WeatherStore } from '../../weather/stores/weatherStore';
import { useAudioStoreApi, type AudioStore } from '../stores/audioStore';
import type { BgmTrack } from '../types';

const SCALE_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const SCALE_MINOR = [0, 2, 3, 5, 7, 8, 10];

function pickScale(weather: string | undefined): number[] {
  if (weather === 'rain' || weather === 'storm' || weather === 'snow') return SCALE_MINOR;
  return SCALE_MAJOR;
}

function periodOfDay(hour: number): 'dawn' | 'day' | 'dusk' | 'night' {
  if (hour < 6) return 'night';
  if (hour < 10) return 'dawn';
  if (hour < 18) return 'day';
  if (hour < 22) return 'dusk';
  return 'night';
}

function trackForContext(hour: number, weather: string | undefined): BgmTrack {
  const period = periodOfDay(hour);
  const scale = pickScale(weather);
  const baseFreq = period === 'night' ? 174.6
    : period === 'dawn' ? 220
    : period === 'dusk' ? 196
    : 261.6;
  const interval = period === 'day' ? 700 : 950;
  const pattern = [scale[0]!, scale[2]!, scale[4]!, scale[2]!, scale[0]!, scale[3]!, scale[1]!, scale[4]!];
  return {
    id: `bgm.${period}.${weather ?? 'unknown'}`,
    baseFreq,
    intervalMs: interval,
    pattern,
    volume: weather === 'storm' ? 0.6 : 1,
  };
}

type Lease = { owners: number; dispose: () => void };
const leases = new WeakMap<AudioStore, WeakMap<TimeStore, WeakMap<WeatherStore, Lease>>>();

function acquireAmbientBgm(audioStore: AudioStore, timeStore: TimeStore, weatherStore: WeatherStore, save?: SaveSystem): () => void {
  let clocks = leases.get(audioStore);
  if (!clocks) { clocks = new WeakMap(); leases.set(audioStore, clocks); }
  let weather = clocks.get(timeStore);
  if (!weather) { weather = new WeakMap(); clocks.set(timeStore, weather); }
  let lease = weather.get(weatherStore);
  if (!lease) {
    let ownedRevision: number | undefined;
    let alive = true;
    const apply = () => {
      if (!alive || save?.isRestoring()) return;
      const t = timeStore.getState();
      const w = weatherStore.getState().current;
      const track = trackForContext(t.time.hour, w?.kind);
      if (audioStore.getState().currentBgmId !== track.id) {
        ownedRevision = audioStore.getState().bgmRevision + 1;
        audioStore.getState().playBgm(track);
      }
    };
    const offTime = timeStore.subscribe((s, p) => {
      if (s.time.hour !== p.time.hour) apply();
    });
    const offWeather = weatherStore.subscribe((s, p) => {
      if (s.current?.kind !== p.current?.kind) apply();
    });
    const offRestore = save?.registerRestoreGuard(() => apply);
    apply();
    lease = { owners: 0, dispose: () => {
      alive = false;
      offTime(); offWeather(); offRestore?.();
      // A manual replacement, including one with the same track ID, has a new owner.
      if (audioStore.getState().bgmRevision === ownedRevision) audioStore.getState().stopBgm();
    } };
    weather.set(weatherStore, lease);
  }
  const owned = lease; owned.owners++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--owned.owners === 0) { weather!.delete(weatherStore); owned.dispose(); }
  };
}

export function useAmbientBgm(enabled: boolean = true): void {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const audioStore = useAudioStoreApi();
  const weatherStore = useWeatherStoreApi();
  const timeStore = useTimeStoreApi();
  useEffect(() => {
    if (!enabled || (runtime && !runtime.isActive())) return;
    return acquireAmbientBgm(audioStore, timeStore, weatherStore, runtime?.save);
  }, [enabled, timeStore, weatherStore, audioStore, runtime, revision]);
}
