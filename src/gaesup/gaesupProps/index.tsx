import { vec3 } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gameStore } from '../store/gameStore';
import { useClicker } from '../hooks/useInputControls';

export function GaeSupProps({
  type = 'normal',
  text,
  position,
  children,
}: {
  type?: 'normal' | 'ground';
  text?: string;
  position?: [number, number, number];
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { moveClicker } = useClicker();
  useEffect(() => {
    if (groupRef.current && text) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3())).clone();
      const center = vec3(box.getCenter(new THREE.Vector3())).clone();
      const obj = {
        type: type ? type : 'normal',
        text,
        size,
        center,
      };

      (gameStore.minimap.props as any)[text] = obj;
    }
  }, [text, type]);

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => {
        if (e.srcElement instanceof HTMLDivElement) return;
        moveClicker(e, false, type);
      }}
    >
      {children}
    </group>
  );
}
