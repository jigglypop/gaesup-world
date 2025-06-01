import { vec3 } from '@react-three/rapier';
import { useContext, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import * as THREE from 'three';
import { useClicker } from '../hooks/useClicker';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { minimapAtom } from '../atoms/minimapAtom';

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
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [minimap, setMinimap] = useAtom(minimapAtom);
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

      setMinimap(prev => ({
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
