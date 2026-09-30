import { useEffect, useMemo, useRef } from 'react';

import * as THREE from 'three';

import { MILLISECONDS_IN_SECOND } from '../../../boilerplate/types';
import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';
import { useEngineFrame } from '../../../runtime/frame';
import { weatherField } from '../../../weather/core/field';

export type FootprintsProps = {
  /** Maximum number of footprints kept on screen at once. */
  capacity?: number;
  /** Distance (m) the player must travel before a new footprint is laid. */
  step?: number;
  /** Lifetime in seconds before a footprint is fully faded out. */
  lifetime?: number;
  /** Footprint quad size (m). */
  size?: number;
  /** Y offset above ground (m). Avoids z-fighting on flat tiles. */
  y?: number;
  /** Color of the footprint shadow; ignored with `weather`. */
  color?: THREE.ColorRepresentation;
  /**
   * Prints only where the live weather leaves them: blue-grey dents in lying snow, dark prints on wet ground, none on a
   * dry day.
   */
  weather?: boolean;
};

const SNOW_PRINT = new THREE.Color('#8fa3bd');
const WET_PRINT = new THREE.Color('#2b2620');
const OPACITY = 0.42;

/** How strongly the live weather shows prints (0 on a dry day) and their color. */
export function weatherPrint(field: { snowCover: number; wetness: number }, out: THREE.Color): number {
  const snow = field.snowCover;
  const wet = field.wetness * 0.8;
  out.copy(snow >= wet ? SNOW_PRINT : WET_PRINT);
  return Math.min(1, Math.max(snow, wet) * 1.5);
}

/**
 * Lightweight footprint trail. Drops a small dark quad at the player's
 * position whenever they have walked a configurable distance, fades it out
 * over `lifetime`, and recycles the slot when capacity is exceeded.
 *
 * Single instanced mesh + per-instance color for fade => O(1) cost regardless
 * of how long the player has been walking; nothing is written while no print shows.
 */
export function Footprints({
  capacity = 64,
  step = 0.55,
  lifetime = 9,
  size = 0.34,
  y = 0.02,
  color = '#1a1612',
  weather = false,
}: FootprintsProps = {}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const player = usePlayerPosition({ updateInterval: 32, reactive: false });
  const { position } = player;

  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  const slots = useMemo(
    () =>
      Array.from({ length: capacity }, () => ({
        x: 0,
        z: 0,
        bornAt: -Infinity,
        side: 1 as 1 | -1,
      })),
    [capacity],
  );

  const lastDropRef = useRef<{ x: number; z: number } | null>(null);
  const cursorRef = useRef(0);
  const sideRef = useRef<1 | -1>(1);
  const shownRef = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.CircleGeometry(0.5, 10);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: OPACITY,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    [baseColor],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorTmp = useMemo(() => new THREE.Color(), []);

  useEngineFrame('lateUpdate', (_delta, elapsedMs) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = elapsedMs / MILLISECONDS_IN_SECOND;
    let strength = 1;
    if (weather) strength = weatherPrint(weatherField, material.color);
    else material.color.copy(baseColor);
    material.opacity = OPACITY * strength;

    if (player.isGrounded && player.isMoving && strength > 0) {
      const last = lastDropRef.current;
      const dx = position.x - (last?.x ?? position.x);
      const dz = position.z - (last?.z ?? position.z);
      const dist = Math.hypot(dx, dz);
      if (!last || dist >= step) {
        const slot = slots[cursorRef.current];
        if (slot) {
          slot.x = position.x;
          slot.z = position.z;
          slot.bornAt = now;
          slot.side = sideRef.current;
          sideRef.current = sideRef.current === 1 ? -1 : 1;
          cursorRef.current = (cursorRef.current + 1) % capacity;
          lastDropRef.current = { x: position.x, z: position.z };
        }
      }
    }

    let active = 0;
    for (let i = 0; i < capacity; i++) {
      const s = slots[i];
      if (!s) continue;
      const age = now - s.bornAt;
      if (age < 0 || age > lifetime) continue;
      const fade = 1 - age / lifetime;
      dummy.position.set(s.x + s.side * 0.07, y, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(size, 1, size * 1.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(active, dummy.matrix);
      colorTmp.setScalar(0.6 + fade * 0.4);
      mesh.setColorAt(active, colorTmp);
      active++;
    }

    mesh.count = active;
    if (active === 0 && shownRef.current === 0) return;
    shownRef.current = active;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, { label: 'effects:footprints' });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, capacity]}
      frustumCulled={false}
      renderOrder={1}
    />
  );
}

export default Footprints;
