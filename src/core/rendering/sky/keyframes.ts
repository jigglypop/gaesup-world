import * as THREE from 'three';

import type { Season } from '../../time/types';
import type { WeatherKind } from '../../weather/types';

export type SkyKeyframe = {
  /** Game hour (0-24, fractional ok). */
  hour: number;
  sunColor: string;
  ambientColor: string;
  sunIntensity: number;
  ambientIntensity: number;
  /** Sun azimuth in radians around Y. */
  azimuth: number;
  /** Sun elevation in radians (0 = horizon). */
  elevation: number;
};

export const DEFAULT_KEYFRAMES: readonly SkyKeyframe[] = [
  { hour: 0,  sunColor: '#1f2a48', ambientColor: '#1a1f2e', sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5,  sunColor: '#3b3a5a', ambientColor: '#28304a', sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7,  sunColor: '#ffb27a', ambientColor: '#7a8aa6', sunIntensity: 0.55, ambientIntensity: 0.30, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: '#fff1c8', ambientColor: '#aab4c8', sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: '#ffffff', ambientColor: '#b6c2d8', sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0,             elevation: 1.05 },
  { hour: 16, sunColor: '#ffe0a8', ambientColor: '#a8b4cc', sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6,  elevation: 0.65 },
  { hour: 18, sunColor: '#ff9a5a', ambientColor: '#806a8a', sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3,  elevation: 0.18 },
  { hour: 20, sunColor: '#5a3f6a', ambientColor: '#34304a', sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2,  elevation: -0.05 },
  { hour: 24, sunColor: '#1f2a48', ambientColor: '#1a1f2e', sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 },
];

export const SEASON_TINT: Record<Season, THREE.Color> = {
  spring: new THREE.Color('#fff0f5'),
  summer: new THREE.Color('#fff5d8'),
  autumn: new THREE.Color('#ffd9b0'),
  winter: new THREE.Color('#dfe8f5'),
};

export const WEATHER_FACTORS: Record<WeatherKind, { sun: number; ambient: number; tint: THREE.Color }> = {
  sunny:  { sun: 1.0,  ambient: 1.0,  tint: new THREE.Color('#ffffff') },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new THREE.Color('#cfd6e2') },
  rain:   { sun: 0.30, ambient: 0.85, tint: new THREE.Color('#90a0b8') },
  snow:   { sun: 0.65, ambient: 1.10, tint: new THREE.Color('#dfeaf5') },
  storm:  { sun: 0.20, ambient: 0.75, tint: new THREE.Color('#5a6a82') },
};

export type SkySample = {
  sunColor: THREE.Color;
  ambientColor: THREE.Color;
  sunIntensity: number;
  ambientIntensity: number;
  azimuth: number;
  elevation: number;
};

export function createSkySample(): SkySample {
  return { sunColor: new THREE.Color(), ambientColor: new THREE.Color(), sunIntensity: 0, ambientIntensity: 0, azimuth: 0, elevation: 0 };
}

type ParsedKeyframe = Omit<SkyKeyframe, 'sunColor' | 'ambientColor'> & { sunColor: THREE.Color; ambientColor: THREE.Color };

/**
 * Parses keyframe colors once and returns a sampler that blends the two keyframes around an hour into `out`
 * without allocating. Colors blend like the other fields, so they no longer jump at keyframe boundaries.
 */
export function createSkySampler(frames: readonly SkyKeyframe[]): (hour: number, out: SkySample) => SkySample {
  const parsed: ParsedKeyframe[] = [...frames]
    .sort((a, b) => a.hour - b.hour)
    .map((frame) => ({ ...frame, sunColor: new THREE.Color(frame.sunColor), ambientColor: new THREE.Color(frame.ambientColor) }));
  return (hour, out) => {
    const wrapped = ((hour % 24) + 24) % 24;
    let prev = parsed[0]!;
    let next = parsed[parsed.length - 1]!;
    for (let index = 0; index < parsed.length - 1; index += 1) {
      const a = parsed[index]!;
      const b = parsed[index + 1]!;
      if (wrapped >= a.hour && wrapped <= b.hour) {
        prev = a;
        next = b;
        break;
      }
    }
    const t = THREE.MathUtils.clamp((wrapped - prev.hour) / Math.max(0.0001, next.hour - prev.hour), 0, 1);
    out.sunColor.copy(prev.sunColor).lerp(next.sunColor, t);
    out.ambientColor.copy(prev.ambientColor).lerp(next.ambientColor, t);
    out.sunIntensity = THREE.MathUtils.lerp(prev.sunIntensity, next.sunIntensity, t);
    out.ambientIntensity = THREE.MathUtils.lerp(prev.ambientIntensity, next.ambientIntensity, t);
    out.azimuth = THREE.MathUtils.lerp(prev.azimuth, next.azimuth, t);
    out.elevation = THREE.MathUtils.lerp(prev.elevation, next.elevation, t);
    return out;
  };
}
