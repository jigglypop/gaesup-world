import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../../weather/stores/weatherStore';
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

export type DynamicSkyProps = {
  /** Distance from origin used to position the directional light. */
  rigDistance?: number;
  /** Cast shadows from the directional light. Defaults to true. */
  castShadow?: boolean;
  /** Shadow map resolution (square). Defaults to 1024. */
  shadowMapSize?: number;
  /** Override the default keyframes. */
  keyframes?: SkyKeyframe[];
  /** Damping factor for color/intensity easing (0..1). */
  damping?: number;
};

const DEFAULT_KEYFRAMES: SkyKeyframe[] = [
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

const SEASON_TINT: Record<Season, THREE.Color> = {
  spring: new THREE.Color('#fff0f5'),
  summer: new THREE.Color('#fff5d8'),
  autumn: new THREE.Color('#ffd9b0'),
  winter: new THREE.Color('#dfe8f5'),
};

const WEATHER_FACTORS: Record<WeatherKind, { sun: number; ambient: number; tint: THREE.Color }> = {
  sunny:  { sun: 1.0,  ambient: 1.0,  tint: new THREE.Color('#ffffff') },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new THREE.Color('#cfd6e2') },
  rain:   { sun: 0.30, ambient: 0.85, tint: new THREE.Color('#90a0b8') },
  snow:   { sun: 0.65, ambient: 1.10, tint: new THREE.Color('#dfeaf5') },
  storm:  { sun: 0.20, ambient: 0.75, tint: new THREE.Color('#5a6a82') },
};

function lerpKeyframes(frames: SkyKeyframe[], hour: number): SkyKeyframe {
  const sorted = frames; // assumed sorted ascending by hour
  const wrapHour = ((hour % 24) + 24) % 24;

  let prev = sorted[0]!;
  let next = sorted[sorted.length - 1]!;
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (wrapHour >= a.hour && wrapHour <= b.hour) {
      prev = a; next = b; break;
    }
  }
  const span = Math.max(0.0001, next.hour - prev.hour);
  const t = THREE.MathUtils.clamp((wrapHour - prev.hour) / span, 0, 1);

  return {
    hour: wrapHour,
    sunColor: prev.sunColor,
    ambientColor: prev.ambientColor,
    sunIntensity: THREE.MathUtils.lerp(prev.sunIntensity, next.sunIntensity, t),
    ambientIntensity: THREE.MathUtils.lerp(prev.ambientIntensity, next.ambientIntensity, t),
    azimuth: THREE.MathUtils.lerp(prev.azimuth, next.azimuth, t),
    elevation: THREE.MathUtils.lerp(prev.elevation, next.elevation, t),
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}

/**
 * Time + weather + season aware lighting rig.
 *
 * Owns a `directionalLight` (the sun) and an `ambientLight` whose color,
 * intensity, and orientation are interpolated each frame from a small
 * keyframe table. Weather scales intensity and tints toward overcast or
 * stormy palettes; seasons add a subtle warm/cool tint.
 *
 * Mount once inside the R3F scene, replacing manual `directionalLight`
 * + `ambientLight` setups.
 */
export function DynamicSky({
  rigDistance = 60,
  castShadow = true,
  shadowMapSize = 1024,
  keyframes,
  damping = 0.12,
}: DynamicSkyProps = {}) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  const frames = useMemo(() => {
    const list = (keyframes ?? DEFAULT_KEYFRAMES).slice().sort((a, b) => a.hour - b.hour);
    return list;
  }, [keyframes]);

  const tmpSun = useMemo(() => new THREE.Color(), []);
  const tmpAmbient = useMemo(() => new THREE.Color(), []);
  const targetSun = useMemo(() => new THREE.Color(), []);
  const targetAmbient = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const sun = sunRef.current;
    const ambient = ambientRef.current;
    if (!sun || !ambient) return;

    const t = useTimeStore.getState().time;
    const w = useWeatherStore.getState().current;
    const weather = w?.kind ?? 'sunny';
    const intensity01 = THREE.MathUtils.clamp(w?.intensity ?? 0.5, 0, 1);
    const factor = WEATHER_FACTORS[weather] ?? WEATHER_FACTORS.sunny;
    const seasonTint = SEASON_TINT[t.season] ?? SEASON_TINT.spring;

    const k = lerpKeyframes(frames, t.hour + t.minute / 60);

    // Compose target colors: keyframe -> season tint -> weather tint.
    targetSun.set(k.sunColor).lerp(seasonTint, 0.18).lerp(factor.tint, 0.35 + 0.25 * intensity01);
    targetAmbient.set(k.ambientColor).lerp(seasonTint, 0.20).lerp(factor.tint, 0.30 + 0.30 * intensity01);

    const easing = THREE.MathUtils.clamp(damping, 0.01, 1);
    tmpSun.copy(sun.color).lerp(targetSun, easing);
    tmpAmbient.copy(ambient.color).lerp(targetAmbient, easing);
    sun.color.copy(tmpSun);
    ambient.color.copy(tmpAmbient);

    const sunMul = THREE.MathUtils.lerp(1, factor.sun, 0.5 + 0.5 * intensity01);
    const ambMul = THREE.MathUtils.lerp(1, factor.ambient, 0.5 + 0.5 * intensity01);
    sun.intensity = THREE.MathUtils.lerp(sun.intensity, k.sunIntensity * sunMul, easing);
    ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, k.ambientIntensity * ambMul, easing);

    const cosE = Math.cos(k.elevation);
    const sinE = Math.sin(k.elevation);
    const x = Math.cos(k.azimuth) * cosE * rigDistance;
    const z = Math.sin(k.azimuth) * cosE * rigDistance;
    const y = Math.max(2, sinE * rigDistance);
    sun.position.set(x, y, z);
    sun.target.position.set(0, 0, 0);
    sun.target.updateMatrixWorld();
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} color="#b6c2d8" />
      <directionalLight
        ref={sunRef}
        castShadow={castShadow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-normalBias={0.06}
        shadow-camera-near={1}
        shadow-camera-far={Math.max(120, rigDistance * 2)}
        shadow-camera-top={90}
        shadow-camera-right={90}
        shadow-camera-bottom={-90}
        shadow-camera-left={-90}
        intensity={0.8}
        color="#ffffff"
        position={[20, 30, 10]}
      />
    </>
  );
}

export default DynamicSky;
