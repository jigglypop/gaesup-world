import { useRef, useState } from 'react';

import { useWeatherLighting } from './lighting';
import { useQualityProfile } from '../../../perf/quality';
import { CompileGate } from '../../../rendering/CompileGate';
import { useEngineFrame } from '../../../runtime/frame';
import { useTimeStore } from '../../../time/stores/timeStore';
import type { Season } from '../../../time/types';
import { weatherField } from '../../core/field';
import { useWeatherClimate } from '../../hooks/useWeatherClimate';
import type { PrecipitationKind } from '../../types';
import { Precipitation, precipitationAmount } from '../Precipitation';

export type WeatherProps = {
  /** Scales every layer's particle count; the quality profile's `instanceScale` (else 1) when unset. */
  density?: number;
  /** Half the side of the particle volume kept around the view, in meters. */
  radius?: number;
  /** Height of the particle volume above `ground`. */
  height?: number;
  /** World height rain and snow fall to and splashes land on. */
  ground?: number;
  /** Dims, cools and flashes the scene's sun, sky fill and background with the weather. */
  lighting?: boolean;
  /** Storm flashes; also off when the viewer prefers reduced motion. */
  lightning?: boolean;
};

/** Particles each layer draws at full strength, before `density`. */
const COUNTS: Record<PrecipitationKind, number> = { rain: 7000, splash: 600, snow: 6000, leaves: 700 };
const KINDS: readonly PrecipitationKind[] = ['rain', 'splash', 'snow', 'leaves'];
/** Petals in spring, green leaves in summer, red and gold in autumn, dry leaves in winter. */
const LEAVES: Record<Season, readonly [string, string]> = {
  spring: ['#f3b1c6', '#fde2ea'],
  summer: ['#6b9a43', '#a9c766'],
  autumn: ['#d4602a', '#e8b13c'],
  winter: ['#9a8a6c', '#c7baa0'],
};
/** Seconds a layer stays after its weather has gone, so a quick change back reuses its pipeline. */
const LINGER = 20;

/** The layers the live weather draws, mounted when they start and kept a while after they stop. */
function useLayers(): readonly PrecipitationKind[] {
  const [layers, setLayers] = useState<readonly PrecipitationKind[]>([]);
  const idle = useRef(new Map<PrecipitationKind, number>());
  useEngineFrame('effects', (delta) => {
    const next = KINDS.filter((kind) => {
      const seconds = precipitationAmount(kind, weatherField) > 0.001 ? 0 : (idle.current.get(kind) ?? LINGER) + delta;
      idle.current.set(kind, seconds);
      return seconds < LINGER;
    });
    if (next.length !== layers.length || next.some((kind, index) => kind !== layers[index])) setLayers(next);
  }, { label: 'weather:layers' });
  return layers;
}

/**
 * The weather of this runtime, drawn: steps the live climate (`useWeatherClimate`), rains, snows and blows leaves in a
 * volume that follows the view, splashes the ground, and dims the light (`useWeatherLighting`). Everything moves on the
 * GPU; a weather change only moves uniforms. `BuildingSystem` mounts it for the island's own weather.
 */
export function Weather({ density, radius = 14, height = 24, ground = 0, lighting = true, lightning = true }: WeatherProps) {
  useWeatherClimate({ lightning });
  useWeatherLighting(lighting);
  const layers = useLayers();
  const profile = useQualityProfile();
  const scale = density ?? profile?.instanceScale ?? 1;
  const season = useTimeStore((state) => state.time.season);
  return (
    <group name="weather">
      {layers.map((kind) => (
        <CompileGate key={kind}>
          <Precipitation
            kind={kind}
            count={Math.max(1, Math.round(COUNTS[kind] * scale))}
            radius={kind === 'splash' ? radius * 0.6 : radius}
            height={height}
            ground={ground}
            tint={LEAVES[season]}
          />
        </CompileGate>
      ))}
    </group>
  );
}

export default Weather;
