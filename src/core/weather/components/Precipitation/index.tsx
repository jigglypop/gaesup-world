import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { createPrecipitationGlMaterial } from './glsl';
import { createPrecipitationNodeMaterial, createPrecipitationUniforms } from '../../../rendering/tsl/weather';
import { rendererKind } from '../../../rendering/webgpu';
import { useEngineFrame } from '../../../runtime/frame';
import { WIND_SPEED } from '../../core/climate';
import { weatherField, type WeatherField } from '../../core/field';
import type { PrecipitationKind } from '../../types';

export type PrecipitationProps = {
  kind: PrecipitationKind;
  /** Particles drawn at full amount. */
  count: number;
  /** Half the side of the volume kept around the view, in meters. */
  radius?: number;
  /** Height of the volume above `ground`. */
  height?: number;
  /** World height the rain and snow fall to and splashes land on. */
  ground?: number;
  /** 0..1 share of `count` drawn; the live weather's when unset. */
  amount?: number;
  /** Two leaf colors, blended per leaf. */
  tint?: readonly [THREE.ColorRepresentation, THREE.ColorRepresentation];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** How much of a layer the live weather draws. */
export function precipitationAmount(kind: PrecipitationKind, field: Readonly<WeatherField>): number {
  switch (kind) {
    case 'rain': return field.rain;
    case 'splash': return field.rain > 0.08 ? field.rain : 0;
    case 'snow': return field.snow;
    case 'leaves': return clamp01((field.windStrength - 0.55) / 0.55);
  }
}

/** How far each layer drifts with the wind. */
const DRIFT: Record<PrecipitationKind, number> = { rain: 1, splash: 0, snow: 0.7, leaves: 1 };

function seeded(count: number): Float32Array {
  const values = new Float32Array(count * 4);
  let state = 0x9e3779b9;
  for (let index = 0; index < values.length; index++) {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    values[index] = (state >>> 0) / 0x100000000;
  }
  return values;
}

function createGeometry(count: number): THREE.InstancedBufferGeometry {
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry().copy(plane as unknown as THREE.InstancedBufferGeometry);
  plane.dispose();
  geometry.setAttribute('weatherSeed', new THREE.InstancedBufferAttribute(seeded(count), 4));
  geometry.instanceCount = 0;
  return geometry;
}

type Layer = {
  material: THREE.Material;
  set: (radius: number, ground: number, tint: PrecipitationProps['tint']) => void;
  update: (offsetX: number, offsetZ: number, height: number, field: Readonly<WeatherField>, delta: number) => void;
};

function nodeLayer(kind: PrecipitationKind): Layer {
  const u = createPrecipitationUniforms();
  return {
    material: createPrecipitationNodeMaterial(kind, u),
    set: (radius, ground, tint) => {
      u.radius.value = radius;
      u.ground.value = ground;
      if (tint) { u.tint.value.set(tint[0]); u.tintAlt.value.set(tint[1]); }
    },
    update: (x, z, height, field) => {
      u.offset.value.set(x, z);
      u.height.value = height;
      u.velocity.value.set(field.windX, field.windZ).multiplyScalar(field.windStrength * WIND_SPEED);
    },
  };
}

function glLayer(kind: PrecipitationKind): Layer {
  const material = createPrecipitationGlMaterial(kind);
  const u = material.uniforms as Record<string, THREE.IUniform>;
  const value = <T,>(name: string) => u[name]!.value as T;
  return {
    material,
    set: (radius, ground, tint) => {
      u['uRadius']!.value = radius;
      u['uGround']!.value = ground;
      if (tint) { value<THREE.Color>('uTint').set(tint[0]); value<THREE.Color>('uTintAlt').set(tint[1]); }
    },
    update: (x, z, height, field, delta) => {
      u['uTime']!.value = value<number>('uTime') + delta;
      u['uHeight']!.value = height;
      value<THREE.Vector2>('uOffset').set(x, z);
      value<THREE.Vector2>('uVelocity').set(field.windX, field.windZ).multiplyScalar(field.windStrength * WIND_SPEED);
      // Unlit on this path: the weather's own dimming and flashes stand in for the scene's light.
      u['uLight']!.value = 1 - 0.35 * field.overcast + 0.8 * field.lightning;
    },
  };
}

/**
 * One layer of weather particles: `count` instances of a quad placed entirely on the GPU in a volume that follows the
 * view. Each frame only the drawn share (`amount`) and a few uniforms change; nothing is rebuilt as the weather eases.
 */
export function Precipitation({ kind, count, radius = 20, height = 22, ground = 0, amount, tint }: PrecipitationProps) {
  const nodes = useThree((state) => rendererKind(state.gl) !== 'webgl');
  const getThree = useThree((state) => state.get);
  const geometry = useMemo(() => createGeometry(Math.max(1, Math.floor(count))), [count]);
  const layer = useMemo(() => (nodes ? nodeLayer(kind) : glLayer(kind)), [nodes, kind]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => layer.material.dispose(), [layer]);
  useLayoutEffect(() => layer.set(radius, ground, tint), [layer, radius, ground, tint]);
  const fitted = useRef(height);

  useEngineFrame('effects', (delta) => {
    const share = clamp01(amount ?? precipitationAmount(kind, weatherField));
    geometry.instanceCount = Math.round(geometry.getAttribute('weatherSeed').count * share);
    if (geometry.instanceCount === 0) return;
    const span = radius * 2;
    const wrap = (value: number) => THREE.MathUtils.euclideanModulo(value * DRIFT[kind], span);
    // Falls from a little above the view down to the ground: a camera high over the island sees no particle above it.
    const fit = THREE.MathUtils.clamp(getThree().camera.position.y - ground + 4, 8, height);
    fitted.current += (fit - fitted.current) * (1 - Math.exp(-delta / 1.5));
    layer.update(wrap(weatherField.windOffsetX), wrap(weatherField.windOffsetZ), fitted.current, weatherField, delta);
  }, { label: `weather:${kind}` });

  return <mesh geometry={geometry} material={layer.material} frustumCulled={false} renderOrder={kind === 'leaves' ? 0 : 2} />;
}
