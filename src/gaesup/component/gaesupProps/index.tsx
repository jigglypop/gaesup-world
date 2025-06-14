import { vec3 } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '../../stores/gaesupStore';
import { useClicker } from '../../hooks/useClicker';
import { GaeSupPropsType } from './types';

export function GaeSupProps({ type = 'normal', text, position, children }: GaeSupPropsType) {
  const groupRef = useRef<THREE.Group>(null);
  const addMinimapMarker = useGaesupStore((state) => state.addMinimapMarker);
  const { moveClicker } = useClicker();

  useEffect(() => {
    if (groupRef.current && text) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3())).clone();
      const center = vec3(box.getCenter(new THREE.Vector3())).clone();

      addMinimapMarker(text, {
        type: type ? type : 'normal',
        text,
        size,
        center,
      });
    }
  }, [text, type, addMinimapMarker]);

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
