import { useEffect, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../../weather/stores/weatherStore';

export type DynamicFogProps = {
  /** Base fog color (sunny noon). */
  color?: THREE.ColorRepresentation;
  /** Base near distance (sunny noon). */
  near?: number;
  /** Base far distance (sunny noon). */
  far?: number;
  /** Disable to fall back to whatever fog is on the scene already. */
  enabled?: boolean;
};

const NIGHT_COLOR = new THREE.Color('#0a1430');
const DAWN_COLOR = new THREE.Color('#ffb377');
const DUSK_COLOR = new THREE.Color('#ff7a52');
const RAIN_COLOR = new THREE.Color('#5b6975');
const SNOW_COLOR = new THREE.Color('#dde7f0');
const STORM_COLOR = new THREE.Color('#3b4452');

function dayBlend(hour: number, minute: number): { t: number; phase: 'night' | 'dawn' | 'day' | 'dusk' } {
  const h = hour + minute / 60;
  if (h < 5) return { t: 0, phase: 'night' };
  if (h < 7) return { t: (h - 5) / 2, phase: 'dawn' };
  if (h < 17) return { t: 1, phase: 'day' };
  if (h < 19) return { t: 1 - (h - 17) / 2, phase: 'dusk' };
  return { t: 0, phase: 'night' };
}

/**
 * Drives `scene.fog` based on the current game time + weather.
 *
 * - Night/dawn/day/dusk shift the base color and pull fog closer at night.
 * - Rain/storm/snow override the color and tighten the falloff so the world
 *   feels denser during bad weather.
 *
 * Mount once anywhere inside the R3F Canvas; it has no children.
 */
export function DynamicFog({
  color = '#cfd8e3',
  near = 35,
  far = 220,
  enabled = true,
}: DynamicFogProps = {}) {
  const scene = useThree((s) => s.scene);
  const hour = useTimeStore((s) => s.time.hour);
  const minute = useTimeStore((s) => s.time.minute);
  const weather = useWeatherStore((s) => s.current);
  const previousFogRef = useRef<THREE.Fog | null | undefined>(undefined);

  useEffect(() => {
    if (previousFogRef.current === undefined) {
      previousFogRef.current = scene.fog instanceof THREE.Fog ? scene.fog.clone() : null;
    }

    if (!enabled) {
      scene.fog = previousFogRef.current ? previousFogRef.current.clone() : null;
      return;
    }

    const base = new THREE.Color(color);
    const blend = dayBlend(hour, minute);

    const target = base.clone();
    if (blend.phase === 'night') target.lerp(NIGHT_COLOR, 0.25);
    else if (blend.phase === 'dawn') target.lerp(DAWN_COLOR, 0.18 * (1 - blend.t));
    else if (blend.phase === 'dusk') target.lerp(DUSK_COLOR, 0.18 * (1 - blend.t));

    let nearD = near;
    let farD = far;

    if (blend.phase === 'night') {
      nearD = near * 0.45;
      farD = far * 0.55;
    } else if (blend.phase === 'dawn' || blend.phase === 'dusk') {
      nearD = near * (0.55 + 0.45 * blend.t);
      farD = far * (0.7 + 0.3 * blend.t);
    }

    if (weather) {
      const i = Math.max(0, Math.min(1, weather.intensity));
      if (weather.kind === 'rain') {
        target.lerp(RAIN_COLOR, 0.12 + i * 0.1);
        nearD *= 0.7 - i * 0.2;
        farD *= 0.65 - i * 0.2;
      } else if (weather.kind === 'storm') {
        target.lerp(STORM_COLOR, 0.16 + i * 0.12);
        nearD *= 0.55 - i * 0.2;
        farD *= 0.5 - i * 0.2;
      } else if (weather.kind === 'snow') {
        target.lerp(SNOW_COLOR, 0.12 + i * 0.08);
        nearD *= 0.75;
        farD *= 0.7;
      }
    }

    nearD = Math.max(2, nearD);
    farD = Math.max(nearD + 5, farD);

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(target);
      scene.fog.near = nearD;
      scene.fog.far = farD;
    } else {
      scene.fog = new THREE.Fog(target.getHex(), nearD, farD);
    }
  }, [scene, color, near, far, enabled, hour, minute, weather?.kind, weather?.intensity]);

  useEffect(() => () => {
    scene.fog = previousFogRef.current ? previousFogRef.current.clone() : null;
  }, [scene]);

  return null;
}

export default DynamicFog;
