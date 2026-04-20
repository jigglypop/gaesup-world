import { useEffect, useMemo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { usePlayerPosition } from '../../../motions/hooks/usePlayerPosition';

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
  /** Color of the footprint shadow. */
  color?: THREE.ColorRepresentation;
};

/**
 * Lightweight footprint trail. Drops a small dark quad at the player's
 * position whenever they have walked a configurable distance, fades it out
 * over `lifetime`, and recycles the slot when capacity is exceeded.
 *
 * Single instanced mesh + per-instance color for fade => O(1) cost regardless
 * of how long the player has been walking.
 */
export function Footprints({
  capacity = 64,
  step = 0.55,
  lifetime = 9,
  size = 0.34,
  y = 0.02,
  color = '#1a1612',
}: FootprintsProps = {}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const { position, isMoving, isGrounded } = usePlayerPosition({ updateInterval: 32 });

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

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.42,
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

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = state.clock.elapsedTime;

    if (isGrounded && isMoving) {
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
      colorTmp.copy(baseColor).multiplyScalar(0.6 + fade * 0.4);
      mesh.setColorAt(active, colorTmp);
      active++;
    }

    mesh.count = active;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

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
