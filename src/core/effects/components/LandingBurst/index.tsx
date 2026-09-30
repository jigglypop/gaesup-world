import { useEffect, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { MILLISECONDS_IN_SECOND } from '../../../boilerplate/types';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { createBurstMaterial } from '../../../rendering/tsl/burst';
import { rendererKind } from '../../../rendering/webgpu';
import { useEngineFrame } from '../../../runtime/frame';
import { weatherField } from '../../../weather/core/field';

export type LandingBurstProps = {
  /** Bursts alive at once; a new one takes the oldest slot. */
  maxBursts?: number;
  /** Puffs per burst. */
  particles?: number;
  /** Downward speed (m/s) a landing needs to raise a burst. */
  minSpeed?: number;
};

const DUST = new THREE.Color('#a88e6a');
const SNOW = new THREE.Color('#f3f7ff');
const SPRAY = new THREE.Color('#b4cde2');
/** Longest puff life in seconds (see `createBurstMaterial`). */
const LIFE = 0.8;

/** What a landing throws up under the live weather: snow on lying snow, spray on wet ground, else dust. */
export function landingColor(field: { snowCover: number; wetness: number }): THREE.Color {
  if (field.snowCover > 0.3) return SNOW;
  return field.wetness > 0.35 ? SPRAY : DUST;
}

function createPool(count: number) {
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry().copy(plane as unknown as THREE.InstancedBufferGeometry);
  plane.dispose();
  const origin = new THREE.InstancedBufferAttribute(new Float32Array(count * 4).fill(-1e6), 4).setUsage(THREE.DynamicDrawUsage);
  const color = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const seed = new Float32Array(count * 4);
  for (let index = 0; index < seed.length; index++) seed[index] = ((index * 0.6180339887) % 1 + Math.sin(index * 12.9898) * 0.5 + 1) % 1;
  geometry.setAttribute('burstOrigin', origin);
  geometry.setAttribute('burstColor', color);
  geometry.setAttribute('burstSeed', new THREE.InstancedBufferAttribute(seed, 4));
  geometry.instanceCount = count;
  return { geometry, origin, color };
}

function NodeLandingBurst({ maxBursts, particles, minSpeed }: Required<LandingBurstProps>) {
  const player = usePlayerPosition({ updateInterval: 0, reactive: false });
  const pool = useMemo(() => createPool(maxBursts * particles), [maxBursts, particles]);
  const burst = useMemo(() => createBurstMaterial(), []);
  const meshRef = useRef<THREE.Mesh>(null);
  const state = useRef({ airborne: false, fall: 0, cursor: 0, until: -1 });
  useEffect(() => () => pool.geometry.dispose(), [pool]);
  useEffect(() => () => burst.material.dispose(), [burst]);

  useEngineFrame('lateUpdate', (_delta, elapsedMs) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const now = elapsedMs / MILLISECONDS_IN_SECOND;
    const s = state.current;
    if (!player.isGrounded) {
      s.airborne = true;
      s.fall = Math.max(s.fall, -player.velocity.y);
    } else if (s.airborne) {
      if (s.fall >= minSpeed) {
        const start = s.cursor * particles;
        const tint = landingColor(weatherField);
        for (let index = start; index < start + particles; index++) {
          pool.origin.setXYZW(index, player.position.x, player.position.y, player.position.z, now);
          pool.color.setXYZ(index, tint.r, tint.g, tint.b);
        }
        pool.origin.clearUpdateRanges();
        pool.origin.addUpdateRange(start * 4, particles * 4);
        pool.origin.needsUpdate = true;
        pool.color.clearUpdateRanges();
        pool.color.addUpdateRange(start * 3, particles * 3);
        pool.color.needsUpdate = true;
        s.cursor = (s.cursor + 1) % maxBursts;
        s.until = now + LIFE;
      }
      s.airborne = false;
      s.fall = 0;
    }
    burst.now.value = now;
    mesh.visible = now <= s.until;
  }, { label: 'effects:landing-burst' });

  return <mesh ref={meshRef} geometry={pool.geometry} material={burst.material} frustumCulled={false} visible={false} renderOrder={2} />;
}

/**
 * A puff where the player lands from a jump or a fall: dust, snow on lying snow, or spray on wet ground. One draw call
 * while a burst lives and none otherwise; a landing writes its puffs once and the GPU moves them. Node renderers only.
 */
export function LandingBurst({ maxBursts = 6, particles = 20, minSpeed = 2.5 }: LandingBurstProps = {}) {
  const nodes = useThree((state) => rendererKind(state.gl) !== 'webgl');
  return nodes ? <NodeLandingBurst maxBursts={maxBursts} particles={particles} minSpeed={minSpeed} /> : null;
}

export default LandingBurst;
