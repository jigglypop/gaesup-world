import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { sceneLighting, type WeatherLight } from '../../../rendering/lighting/zones';
import { useEngineFrame } from '../../../runtime/frame';
import { weatherField, type WeatherField } from '../../core/field';

const RAIN_TINT = new THREE.Color('#a4b3c6');
const SNOW_TINT = new THREE.Color('#dbe6f4');
const RAIN_SKY = new THREE.Color('#8b97a6');
const SNOW_SKY = new THREE.Color('#c5d0db');
const FLASH_SKY = new THREE.Color('#e8edff');
/** A lightning flash at its peak: bright enough to read, far from a white-out. */
const FLASH = 0.85;
/** Seconds between looks for lights mounted since the last one. */
const REFRESH_SECONDS = 2;

export function createWeatherLight(): WeatherLight {
  return { sun: 1, fill: 1, environment: 1, tint: new THREE.Color(), tintAmount: 0, sky: new THREE.Color(), skyAmount: 0 };
}

/**
 * The light of the live weather: an overcast sky takes most of the sun and some fill, cools the tint toward rain grey
 * or snow blue and greys the background; a lightning flash lifts the fill and the sky for a moment.
 */
export function weatherLightOf(field: Readonly<WeatherField>, out: WeatherLight): WeatherLight {
  const overcast = field.overcast;
  const flash = field.lightning * FLASH;
  const snowy = field.snow + field.rain > 0.01 ? field.snow / (field.snow + field.rain) : field.snowCover > 0.5 ? 1 : 0;
  out.sun = 1 - 0.6 * overcast - 0.15 * field.storm;
  out.fill = 1 - 0.18 * overcast - 0.3 * field.storm + 1.1 * flash;
  out.environment = 1 - 0.3 * overcast - 0.2 * field.storm + 1.4 * flash;
  out.tint.copy(RAIN_TINT).lerp(SNOW_TINT, snowy);
  out.tintAmount = 0.5 * overcast + 0.15 * field.storm;
  out.sky.copy(RAIN_SKY).lerp(SNOW_SKY, snowy).lerp(FLASH_SKY, Math.min(1, flash * 1.5));
  out.skyAmount = Math.min(1, 0.75 * overcast + 0.6 * flash);
  return out;
}

const same = (a: WeatherLight, b: WeatherLight) =>
  Math.abs(a.sun - b.sun) < 1e-3 && Math.abs(a.fill - b.fill) < 1e-3 && Math.abs(a.environment - b.environment) < 1e-3 &&
  Math.abs(a.tintAmount - b.tintAmount) < 1e-3 && Math.abs(a.skyAmount - b.skyAmount) < 1e-3 && a.tint.equals(b.tint) && a.sky.equals(b.sky);

const isClear = (light: WeatherLight) =>
  Math.abs(light.sun - 1) < 1e-3 && Math.abs(light.fill - 1) < 1e-3 && Math.abs(light.environment - 1) < 1e-3 &&
  light.tintAmount < 1e-3 && light.skyAmount < 1e-3;

/**
 * Applies the live weather to the scene's sun, sky fill, environment and background color through the scene's
 * lighting layer, together with any lighting zone. Touches the lights only while the weather's light changes; a clear
 * day hands them back untouched.
 */
export function useWeatherLighting(enabled = true): void {
  const scene = useThree((state) => state.scene);
  const light = useMemo(() => ({ next: createWeatherLight(), applied: createWeatherLight(), active: false, refreshIn: 0 }), []);
  useEffect(() => () => {
    if (!light.active) return;
    light.active = false;
    const lighting = sceneLighting(scene);
    lighting.setWeather(null);
    lighting.apply();
  }, [scene, light]);
  useEngineFrame('effects', (delta) => {
    const lighting = sceneLighting(scene);
    const next = weatherLightOf(weatherField, light.next);
    if (!enabled || isClear(next)) {
      if (!light.active) return;
      light.active = false;
      lighting.setWeather(null);
      lighting.apply();
      return;
    }
    light.refreshIn -= delta;
    const refresh = light.refreshIn <= 0;
    if (refresh) {
      light.refreshIn = REFRESH_SECONDS;
      lighting.refresh();
    }
    if (light.active && !refresh && same(next, light.applied)) return;
    light.active = true;
    Object.assign(light.applied, { ...next, tint: light.applied.tint.copy(next.tint), sky: light.applied.sky.copy(next.sky) });
    lighting.setWeather(light.applied);
    lighting.apply();
  }, { label: 'weather:lighting' });
}
