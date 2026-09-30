import { climateTargets } from '../../core/climate';
import { useWeatherStore } from '../../stores/weatherStore';
import type { PrecipitationKind, WeatherKind } from '../../types';
import { Precipitation } from '../Precipitation';

export type WeatherEffectKind = Extract<WeatherKind, 'rain' | 'snow' | 'storm' | 'wind'>;

export type WeatherEffectProps = {
  /** Side of the square particle volume kept around the view, in meters. */
  area?: number;
  height?: number;
  /** Particles of the main layer. */
  count?: number;
  /** Forces a weather at full strength; the runtime's current weather when unset. */
  kind?: WeatherEffectKind;
  /** @deprecated The volume always follows the view. */
  followCamera?: boolean;
  /** @deprecated Particles drift with the live wind that `Weather` steps. */
  wind?: number;
};

const LAYERS: Record<WeatherEffectKind, readonly PrecipitationKind[]> = {
  rain: ['rain', 'splash'],
  storm: ['rain', 'splash'],
  snow: ['snow'],
  wind: ['leaves'],
};

const isEffectKind = (kind: WeatherKind | undefined): kind is WeatherEffectKind => !!kind && kind in LAYERS;

/**
 * The particles of one weather without the rest of `Weather` (no climate, light or lightning): rain with splashes,
 * snow, or blown leaves in a volume that follows the view. Prefer `Weather` for the whole effect.
 */
export function WeatherEffect({ area = 40, height = 22, count = 3000, kind }: WeatherEffectProps) {
  const entry = useWeatherStore((state) => state.current);
  const selected = kind ?? entry?.kind;
  if (!isEffectKind(selected)) return null;
  const targets = kind ? null : climateTargets(entry?.kind, entry?.intensity);
  const amount = !targets || selected === 'wind' ? 1 : selected === 'snow' ? targets.snow : targets.rain;
  const main = selected === 'storm' ? count * 1.4 : count;
  return (
    <>
      {LAYERS[selected].map((layer) => (
        <Precipitation key={layer} kind={layer} count={layer === 'splash' ? main / 8 : main} radius={area / 2} height={height} amount={amount} />
      ))}
    </>
  );
}

export default WeatherEffect;
