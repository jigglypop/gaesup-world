import { useEffect } from 'react';

import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import { useAudioStore } from '../stores/audioStore';
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

export function useAmbientBgm(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const apply = () => {
      const t = useTimeStore.getState();
      const w = useWeatherStore.getState().current;
      const track = trackForContext(t.time.hour, w?.kind);
      const cur = useAudioStore.getState().currentBgmId;
      if (cur !== track.id) useAudioStore.getState().playBgm(track);
    };
    const offTime = useTimeStore.subscribe((s, p) => {
      if (s.time.hour !== p.time.hour) apply();
    });
    const offWeather = useWeatherStore.subscribe((s, p) => {
      if (s.current?.kind !== p.current?.kind) apply();
    });
    apply();
    return () => { offTime(); offWeather(); useAudioStore.getState().stopBgm(); };
  }, [enabled]);
}
