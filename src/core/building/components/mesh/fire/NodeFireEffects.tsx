import { useEffect, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import {
  Color,
  InstancedBufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Sprite,
} from 'three/webgpu';

import type { FireBatchEntry } from './index';
import { getFrameElapsedSeconds } from '../../../../boilerplate/hooks/frameTime';
import { EmberSpriteNodeMaterial, FireSpriteNodeMaterial } from '../../../../rendering/tsl/fire';

const FIRE_LAYERS = [
  { w: 0.78, h: 1, x: 0, y: 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, offset: 0, intensity: 1 },
  { w: 0.52, h: 0.85, x: -0.12, y: 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, offset: 1.7, intensity: 0.82 },
  { w: 0.42, h: 0.7, x: 0.14, y: 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, offset: 3.4, intensity: 0.72 },
] as const;
const EMBERS_PER_FIRE = 18;
const FIRE_INSTANCE_STRIDE = 14;

type EffectObjects = { flame: Sprite; embers: Sprite };

function createEffects(fires: FireBatchEntry[], local: boolean): EffectObjects {
  const flameMaterial = new FireSpriteNodeMaterial();
  const emberMaterial = new EmberSpriteNodeMaterial();
  const flame = new Sprite(flameMaterial);
  const embers = new Sprite(emberMaterial);
  flame.geometry = flame.geometry.clone();
  embers.geometry = embers.geometry.clone();

  const flameCount = fires.length * FIRE_LAYERS.length;
  const flameValues = new Float32Array(flameCount * FIRE_INSTANCE_STRIDE);
  const tint = new Color();
  let flameIndex = 0;
  for (const fire of fires) {
    const cosine = Math.cos(fire.rotation);
    const sine = Math.sin(fire.rotation);
    tint.set(fire.color);
    for (const layer of FIRE_LAYERS) {
      const x = fire.width * layer.x;
      const base = flameIndex * FIRE_INSTANCE_STRIDE;
      flameValues[base] = (local ? 0 : fire.position[0]) + x * cosine + layer.z * sine;
      flameValues[base + 1] = (local ? 0 : fire.position[1]) + fire.height * layer.y;
      flameValues[base + 2] = (local ? 0 : fire.position[2]) + layer.z * cosine - x * sine;
      flameValues[base + 3] = fire.width * layer.w;
      flameValues[base + 4] = fire.height * layer.h;
      flameValues[base + 5] = layer.seed;
      flameValues[base + 6] = layer.lean;
      flameValues[base + 7] = layer.flare;
      flameValues[base + 8] = fire.intensity * layer.intensity;
      flameValues[base + 9] = layer.speed;
      flameValues[base + 10] = layer.offset;
      flameValues[base + 11] = tint.r;
      flameValues[base + 12] = tint.g;
      flameValues[base + 13] = tint.b;
      flameIndex += 1;
    }
  }
  const flameBuffer = new InstancedInterleavedBuffer(flameValues, FIRE_INSTANCE_STRIDE);
  flame.geometry.setAttribute('firePosition', new InterleavedBufferAttribute(flameBuffer, 3, 0));
  flame.geometry.setAttribute('fireScale', new InterleavedBufferAttribute(flameBuffer, 2, 3));
  flame.geometry.setAttribute('fireSeed', new InterleavedBufferAttribute(flameBuffer, 1, 5));
  flame.geometry.setAttribute('fireLean', new InterleavedBufferAttribute(flameBuffer, 1, 6));
  flame.geometry.setAttribute('fireFlare', new InterleavedBufferAttribute(flameBuffer, 1, 7));
  flame.geometry.setAttribute('fireIntensity', new InterleavedBufferAttribute(flameBuffer, 1, 8));
  flame.geometry.setAttribute('fireSpeed', new InterleavedBufferAttribute(flameBuffer, 1, 9));
  flame.geometry.setAttribute('fireTimeOffset', new InterleavedBufferAttribute(flameBuffer, 1, 10));
  flame.geometry.setAttribute('fireTint', new InterleavedBufferAttribute(flameBuffer, 3, 11));
  flame.count = flameCount;
  flame.frustumCulled = false;

  const emberCount = fires.length * EMBERS_PER_FIRE;
  const bases = new Float32Array(emberCount * 3);
  const life = new Float32Array(emberCount);
  const speed = new Float32Array(emberCount);
  const drift = new Float32Array(emberCount);
  let emberIndex = 0;
  for (const fire of fires) {
    for (let index = 0; index < EMBERS_PER_FIRE; index += 1) {
      bases[emberIndex * 3] = (local ? 0 : fire.position[0]) + (Math.random() - 0.5) * fire.width * 0.35;
      bases[emberIndex * 3 + 1] = (local ? 0 : fire.position[1]) + Math.random() * fire.height * 0.2;
      bases[emberIndex * 3 + 2] = (local ? 0 : fire.position[2]) + (Math.random() - 0.5) * fire.width * 0.35;
      life[emberIndex] = Math.random();
      speed[emberIndex] = 0.12 + Math.random() * 0.22;
      drift[emberIndex] = Math.random() * Math.PI * 2;
      emberIndex += 1;
    }
  }
  embers.geometry.setAttribute('emberBase', new InstancedBufferAttribute(bases, 3));
  embers.geometry.setAttribute('emberLife', new InstancedBufferAttribute(life, 1));
  embers.geometry.setAttribute('emberSpeed', new InstancedBufferAttribute(speed, 1));
  embers.geometry.setAttribute('emberDrift', new InstancedBufferAttribute(drift, 1));
  embers.count = emberCount;
  embers.frustumCulled = false;
  return { flame, embers };
}

function NodeFireObjects({ fires, local }: { fires: FireBatchEntry[]; local: boolean }) {
  const objects = useMemo(() => createEffects(fires, local), [fires, local]);
  useEffect(() => () => {
    objects.flame.geometry.dispose();
    objects.flame.material.dispose();
    objects.embers.geometry.dispose();
    objects.embers.material.dispose();
  }, [objects]);
  useFrame((state) => {
    const elapsed = getFrameElapsedSeconds(state);
    (objects.flame.material as FireSpriteNodeMaterial).time = elapsed;
    (objects.embers.material as EmberSpriteNodeMaterial).time = elapsed;
  });
  return <><primitive object={objects.flame} /><primitive object={objects.embers} /></>;
}

export default function NodeFireEffects({ intensity, width, height, color }: {
  intensity: number; width: number; height: number; color: string;
}) {
  const fires = useMemo<FireBatchEntry[]>(() => [{
    position: [0, 0, 0], rotation: 0, intensity, width, height, color,
  }], [color, height, intensity, width]);
  return <NodeFireObjects fires={fires} local />;
}

export function NodeFireBatchEffects({ fires }: { fires: FireBatchEntry[] }) {
  return <NodeFireObjects fires={fires} local={false} />;
}
