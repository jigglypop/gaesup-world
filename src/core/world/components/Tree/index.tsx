import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { notify } from '../../../ui/components/Toast/toastStore';
import { useTimeStore } from '../../../time/stores/timeStore';
import { useToolUse } from '../../../tools/hooks/useToolUse';
import type { ToolUseEvent } from '../../../tools/types';

export type TreeObjectProps = {
  id?: string;
  position: [number, number, number];
  rotationY?: number;
  hp?: number;
  woodDrop?: number;
  regrowMinutes?: number;
  hitRange?: number;
  trunkColor?: string;
  foliageColor?: string;
  scale?: number;
};

const _tmp = new THREE.Vector3();

export function TreeObject({
  position,
  rotationY = 0,
  hp = 3,
  woodDrop = 2,
  regrowMinutes = 1440,
  hitRange = 1.6,
  trunkColor = '#6b4a2a',
  foliageColor = '#3f8a3a',
  scale = 1,
}: TreeObjectProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [remaining, setRemaining] = useState(hp);
  const [fallen, setFallen] = useState(false);
  const regrowAtRef = useRef(0);
  const hitAtRef = useRef(-Infinity);

  const onAxe = useCallback((evt: ToolUseEvent): boolean | void => {
    if (fallen) return;
    const dx = evt.origin[0] - position[0];
    const dz = evt.origin[2] - position[2];
    const distSq = dx * dx + dz * dz;
    const r = hitRange + evt.range * 0.5;
    if (distSq > r * r) return;

    hitAtRef.current = performance.now();
    setRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        const overflow = useInventoryStore.getState().add('wood', woodDrop);
        if (overflow > 0) notify('warn', '인벤토리가 가득 찼습니다');
        else notify('reward', `목재 +${woodDrop}`);
        setFallen(true);
        regrowAtRef.current = useTimeStore.getState().totalMinutes + regrowMinutes;
        return hp;
      }
      return next;
    });
    return true;
  }, [fallen, position, hitRange, woodDrop, regrowMinutes, hp]);

  useToolUse('axe', onAxe);

  useEffect(() => {
    if (!fallen) return;
    const off = useTimeStore.subscribe((state, prev) => {
      if (state.totalMinutes === prev.totalMinutes) return;
      if (state.totalMinutes >= regrowAtRef.current) {
        setFallen(false);
        setRemaining(hp);
      }
    });
    return off;
  }, [fallen, hp]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const since = (performance.now() - hitAtRef.current) / 1000;
    if (since < 0.4) {
      const t = since / 0.4;
      const swing = Math.sin(t * Math.PI * 6) * (1 - t) * 0.18;
      g.rotation.z = swing;
    } else if (Math.abs(g.rotation.z) > 0.0001) {
      g.rotation.z *= Math.max(0, 1 - delta * 12);
    }
  });

  const shake = remaining < hp;
  const trunkHeight = 1.6 * scale;
  const trunkRadius = 0.18 * scale;
  const foliageRadius = 0.95 * scale;

  const tintFoliage = useMemo(() => {
    const c = new THREE.Color(foliageColor);
    if (shake) c.lerp(new THREE.Color('#a55'), 0.06 * (hp - remaining));
    return c;
  }, [foliageColor, shake, hp, remaining]);

  if (fallen) {
    return (
      <group position={position} rotation={[0, rotationY, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.18 * scale, 0]}>
          <cylinderGeometry args={[trunkRadius, trunkRadius * 1.15, 0.36 * scale, 12]} />
          <meshToonMaterial color={trunkColor} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, trunkHeight * 0.5, 0]}>
        <cylinderGeometry args={[trunkRadius * 0.85, trunkRadius, trunkHeight, 12]} />
        <meshToonMaterial color={trunkColor} />
      </mesh>
      <mesh castShadow position={[0, trunkHeight + foliageRadius * 0.6, 0]}>
        <coneGeometry args={[foliageRadius, foliageRadius * 1.6, 14]} />
        <meshToonMaterial color={tintFoliage} />
      </mesh>
      <mesh castShadow position={[0, trunkHeight + foliageRadius * 1.5, 0]}>
        <coneGeometry args={[foliageRadius * 0.75, foliageRadius * 1.2, 14]} />
        <meshToonMaterial color={tintFoliage} />
      </mesh>
    </group>
  );
}

export default TreeObject;
