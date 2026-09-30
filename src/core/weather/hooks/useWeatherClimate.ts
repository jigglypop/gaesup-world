import { useEffect, useState } from 'react';

import { syncWeatherNodes } from '../../rendering/tsl/weatherSurface';
import { useEngineFrame } from '../../runtime/frame';
import { climateTargets, createClimateState, settleClimate, stepClimate } from '../core/climate';
import { claimWeatherField, releaseWeatherField, weatherField, writeWeatherField } from '../core/field';
import { syncWeatherGlUniforms } from '../core/glsl';
import { useWeatherStoreApi } from '../stores/weatherStore';

/** While a world loads, its saved weather shows at once instead of rolling in. */
const SETTLE_SECONDS = 4;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    if (!query) return undefined;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export type WeatherClimateOptions = {
  /** Storm flashes; also off when the viewer prefers reduced motion. */
  lightning?: boolean;
};

/**
 * Steps the page's live weather (`weatherField`, the shared TSL and GLSL uniforms) toward this runtime's current
 * weather once a frame: rain and snow roll in and out, surfaces wet and dry, snow lies and melts, the wind gusts and
 * storms flash now and then. `Weather` mounts it; one mounted driver steps the field at a time.
 */
export function useWeatherClimate({ lightning = true }: WeatherClimateOptions = {}): void {
  const weatherStore = useWeatherStoreApi();
  const reduced = usePrefersReducedMotion();
  const [driver] = useState(() => ({ state: createClimateState(), age: 0 }));
  useEffect(() => () => releaseWeatherField(driver), [driver]);
  useEngineFrame('effects', (delta) => {
    if (!claimWeatherField(driver)) return;
    const current = weatherStore.getState().current;
    const targets = climateTargets(current?.kind, current?.intensity);
    if (driver.age < SETTLE_SECONDS) settleClimate(driver.state, targets);
    driver.age += delta;
    stepClimate(driver.state, targets, delta, { lightning: lightning && !reduced });
    writeWeatherField(driver.state);
    syncWeatherNodes(weatherField);
    syncWeatherGlUniforms(weatherField);
  }, { label: 'weather:climate', order: -10 });
}
