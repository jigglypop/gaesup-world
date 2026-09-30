import { useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';

import { sceneLighting, type LightingProfile, type LightingZoneState } from './zones';
import { useEngineFrame } from '../../runtime/frame';
import { useGaesupRuntime } from '../../runtime/runtimeContext';

export type LightingZoneProps = {
  /** Box center and full size in world meters, like a `GameplayArea`. */
  center: readonly [number, number, number];
  size: readonly [number, number, number];
  profile: LightingProfile;
  /** A light inside the zone, this high over its floor (default 2.6 m); it fades in with the zone and casts no shadow. */
  lamp?: { color?: THREE.ColorRepresentation; intensity: number; distance?: number; height?: number };
  /** Seconds to blend in or out. */
  blendSeconds?: number;
};

const contains = ([cx, cy, cz]: readonly number[], [sx, sy, sz]: readonly number[], { x, y, z }: THREE.Vector3) =>
  Math.abs(x - cx!) <= sx! / 2 && Math.abs(y - cy!) <= sy! / 2 && Math.abs(z - cz!) <= sz! / 2;

/**
 * A lighting volume: while the player stands in its box the scene's sun, sky fill and environment blend toward
 * `profile` over `blendSeconds`, like an interior with its own light, and back once the player leaves. Its lamp is in
 * the scene from the start at zero intensity, so entering never changes the light count and recompiles nothing.
 */
export function LightingZone({ center, size, profile, lamp, blendSeconds = 0.6 }: LightingZoneProps) {
  const scene = useThree((state) => state.scene);
  const runtime = useGaesupRuntime();
  const lampRef = useRef<THREE.PointLight>(null);
  const zone = useRef<LightingZoneState>({ blend: 0, profile }).current;
  zone.profile = profile;

  useEffect(() => {
    const lighting = sceneLighting(scene);
    lighting.zones.set(zone, zone);
    return () => {
      lighting.zones.delete(zone);
      lighting.apply();
    };
  }, [scene, zone]);

  useEngineFrame('effects', (delta) => {
    const position = runtime?.stateManager.getActiveState().position;
    const target = position && contains(center, size, position) ? 1 : 0;
    if (zone.blend === target && target === 0) return;
    const step = delta / Math.max(blendSeconds, 1e-3);
    zone.blend = target > zone.blend ? Math.min(target, zone.blend + step) : Math.max(target, zone.blend - step);
    sceneLighting(scene).apply();
    if (lampRef.current) lampRef.current.intensity = (lamp?.intensity ?? 0) * zone.blend;
  }, { label: 'lighting:zone' });

  if (!lamp) return null;
  const floor = center[1] - size[1] / 2;
  return (
    <pointLight
      ref={lampRef}
      position={[center[0], floor + (lamp.height ?? 2.6), center[2]]}
      color={lamp.color ?? '#ffd9a8'}
      intensity={0}
      distance={lamp.distance ?? 10}
      decay={2}
    />
  );
}
