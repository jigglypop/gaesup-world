import { vec3 } from '@react-three/rapier';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { minimapAtom } from '../atoms';
import { useClicker } from '../hooks/useClicker';
import Minimap from '../tools/minimap';

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
  const [_, setMinimap] = useAtom(minimapAtom);
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

      setMinimap((prev) => ({
        ...prev,
        props: {
          ...prev.props,
          [text]: obj,
        },
      }));
    }
  }, [text, type, setMinimap]);

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
