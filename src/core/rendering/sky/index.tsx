import { useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { createSkySample, createSkySampler, DEFAULT_KEYFRAMES, SEASON_TINT, WEATHER_FACTORS, type SkyKeyframe } from './keyframes';
import { shadowFocus, placeShadowLight } from './shadowFollow';
import { useQualityProfile } from '../../perf/quality';
import { useEngineFrame } from '../../runtime/frame';
import { useTimeStoreApi } from '../../time/stores/timeStore';
import { useWeatherStoreApi } from '../../weather/stores/weatherStore';

export type { SkyKeyframe } from './keyframes';

export type DynamicSkyProps = {
  /** Distance from origin used to position the directional light. */
  rigDistance?: number;
  /** Cast shadows from the directional light. Defaults to true. */
  castShadow?: boolean;
  /** Shadow map resolution (square). Defaults to the world quality profile's size, else 1024. */
  shadowMapSize?: number;
  /** Half-size of the shadow box in world units. */
  shadowRange?: number;
  /** Keep the shadow box on the ground ahead of the camera instead of at the world origin. */
  followCamera?: boolean;
  /** Override the default keyframes. */
  keyframes?: SkyKeyframe[];
  /** Damping factor for color/intensity easing (0..1). */
  damping?: number;
};

/** About 0.2 degrees. */
const SUN_DIRECTION_EPSILON = 0.0035;

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
  shadowMapSize: shadowMapSizeProp,
  shadowRange = 90,
  followCamera = true,
  keyframes,
  damping = 0.12,
}: DynamicSkyProps = {}) {
  const profile = useQualityProfile();
  const shadowMapSize = shadowMapSizeProp ?? profile?.shadowMapSize ?? 1024;
  const getThree = useThree((state) => state.get);
  const weatherStore = useWeatherStoreApi();
  const timeStore = useTimeStoreApi();
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  const sample = useMemo(() => createSkySampler(keyframes ?? DEFAULT_KEYFRAMES), [keyframes]);
  const scratch = useMemo(
    () => ({ sky: createSkySample(), sunOffset: new THREE.Vector3(), appliedOffset: new THREE.Vector3(), focus: new THREE.Vector3() }),
    [],
  );

  // After the camera phase, so the shadow box follows this frame's camera rather than the previous one.
  useEngineFrame('effects', () => {
    const sun = sunRef.current;
    const ambient = ambientRef.current;
    if (!sun || !ambient) return;

    const t = timeStore.getState().time;
    const w = weatherStore.getState().current;
    const intensity01 = THREE.MathUtils.clamp(w?.intensity ?? 0.5, 0, 1);
    const factor = WEATHER_FACTORS[w?.kind ?? 'sunny'] ?? WEATHER_FACTORS.sunny;
    const seasonTint = SEASON_TINT[t.season] ?? SEASON_TINT.spring;
    const k = sample(t.hour + t.minute / 60, scratch.sky);

    // Target colors: keyframe -> season tint -> weather tint, eased from the current color.
    const easing = THREE.MathUtils.clamp(damping, 0.01, 1);
    k.sunColor.lerp(seasonTint, 0.18).lerp(factor.tint, 0.35 + 0.25 * intensity01);
    k.ambientColor.lerp(seasonTint, 0.20).lerp(factor.tint, 0.30 + 0.30 * intensity01);
    sun.color.lerp(k.sunColor, easing);
    ambient.color.lerp(k.ambientColor, easing);

    const sunMul = THREE.MathUtils.lerp(1, factor.sun, 0.5 + 0.5 * intensity01);
    const ambMul = THREE.MathUtils.lerp(1, factor.ambient, 0.5 + 0.5 * intensity01);
    sun.intensity = THREE.MathUtils.lerp(sun.intensity, k.sunIntensity * sunMul, easing);
    ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, k.ambientIntensity * ambMul, easing);

    const cosE = Math.cos(k.elevation);
    const { sunOffset, appliedOffset, focus } = scratch;
    sunOffset.set(Math.cos(k.azimuth) * cosE * rigDistance, Math.max(2, Math.sin(k.elevation) * rigDistance), Math.sin(k.azimuth) * cosE * rigDistance);
    // The sun moves a fraction of a degree per minute; turning the shadow map for each step only makes it swim.
    if (appliedOffset.lengthSq() === 0 || appliedOffset.angleTo(sunOffset) > SUN_DIRECTION_EPSILON) appliedOffset.copy(sunOffset);
    if (followCamera) shadowFocus(getThree().camera, shadowRange, focus);
    else focus.set(0, 0, 0);
    placeShadowLight(sun, focus, appliedOffset, (shadowRange * 2) / shadowMapSize);
  }, { label: 'rendering:dynamic-sky' });

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
        shadow-camera-top={shadowRange}
        shadow-camera-right={shadowRange}
        shadow-camera-bottom={-shadowRange}
        shadow-camera-left={-shadowRange}
        intensity={0.8}
        color="#ffffff"
        position={[20, 30, 10]}
      />
    </>
  );
}

export default DynamicSky;
