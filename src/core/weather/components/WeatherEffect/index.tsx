import React, { useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useWeatherStore } from '../../stores/weatherStore';
import type { WeatherKind } from '../../types';

export type WeatherEffectKind = Extract<WeatherKind, 'rain' | 'snow' | 'storm'> | 'wind';

export type WeatherEffectProps = {
  area?: number;
  height?: number;
  count?: number;
  kind?: WeatherEffectKind;
  followCamera?: boolean;
};

export function WeatherEffect({
  area = 80,
  height = 18,
  count = 1200,
  kind: forcedKind,
  followCamera = false,
}: WeatherEffectProps) {
  const current = useWeatherStore((s) => s.current);
  const ref = useRef<THREE.Points>(null);

  const { geometry, material, kind } = useMemo(() => {
    const effectKind = forcedKind ?? current?.kind;
    if (effectKind !== 'rain' && effectKind !== 'snow' && effectKind !== 'storm' && effectKind !== 'wind') {
      return { geometry: null, material: null, kind: null };
    }
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      speeds[i] =
        effectKind === 'snow' ? 0.6 + Math.random() * 0.4 :
        effectKind === 'wind' ? 5 + Math.random() * 5 :
        8 + Math.random() * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    const isSnow = effectKind === 'snow';
    const isWind = effectKind === 'wind';
    const isStorm = effectKind === 'storm';
    const mat = new THREE.PointsMaterial({
      color: isSnow ? 0xffffff : isWind ? 0xdde7f0 : isStorm ? 0x7fa8d8 : 0x9ad9ff,
      size: isSnow ? 0.18 : isWind ? 0.08 : 0.12,
      transparent: true,
      opacity: isSnow ? 0.85 : isWind ? 0.35 : isStorm ? 0.7 : 0.6,
      depthWrite: false,
      sizeAttenuation: true,
    });
    return { geometry: geo, material: mat, kind: effectKind };
  }, [forcedKind, current?.kind, current?.intensity, area, height, count]);

  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p || !geometry || !kind) return;
    if (followCamera) {
      p.position.set(camera.position.x, camera.position.y - height * 0.35, camera.position.z);
    }
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
    const speeds = geometry.getAttribute('aSpeed') as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const sp = speeds.array as Float32Array;
    const dropFactor = kind === 'snow' || kind === 'wind' ? 1 : 6;
    for (let i = 0; i < arr.length; i += 3) {
      if (kind === 'wind') {
        arr[i + 0]! += sp[i / 3]! * delta * dropFactor;
        arr[i + 1]! += Math.sin((arr[i + 0]! + i) * 0.4) * delta * 0.25;
      } else {
        arr[i + 1]! -= sp[i / 3]! * delta * dropFactor;
      }
      if (kind === 'snow') {
        arr[i + 0]! += Math.sin((arr[i + 1]! + i) * 0.5) * delta * 0.3;
      }
      if (kind === 'wind' && arr[i + 0]! > area * 0.5) {
        arr[i + 0]! = -area * 0.5;
        arr[i + 1]! = Math.random() * height;
        arr[i + 2]! = (Math.random() - 0.5) * area;
      } else if (arr[i + 1]! < 0) {
        arr[i + 0]! = (Math.random() - 0.5) * area;
        arr[i + 1]! = height;
        arr[i + 2]! = (Math.random() - 0.5) * area;
      }
    }
    pos.needsUpdate = true;
  });

  if (!geometry || !material) return null;
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

export default WeatherEffect;
