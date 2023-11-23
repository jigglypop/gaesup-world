import { vec3 } from '@react-three/rapier';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { minimapAtom } from '../minimap';
import { optionsAtom } from '../options';

export type jumpPointType = {
  text: string;
  position: THREE.Vector3;
}[];

export const jumpPointAtom = atom<jumpPointType>([]);

jumpPointAtom.debugLabel = 'jumpPoint';

export default function GaeSupProps({
  text,
  position,
  jumpPoint,
  children
}: {
  text: string;
  position?: [number, number, number];
  jumpPoint?: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const setMiniMap = useSetAtom(minimapAtom);
  const options = useAtomValue(optionsAtom);
  const setJumpPoint = useSetAtom(jumpPointAtom);
  useEffect(() => {
    if (jumpPoint && position) {
      setJumpPoint((jumpPoint) => [
        ...jumpPoint,
        {
          text,
          position: vec3().set(position[0], 5, position[2] + 5)
        }
      ]);
    }
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3()))
        .clone()
        .multiplyScalar(options.minimapRatio);
      const center = vec3(box.getCenter(new THREE.Vector3()))
        .clone()
        .multiplyScalar(options.minimapRatio);
      const obj = {
        text,
        size,
        center
      };
      setMiniMap((minimap) => ({
        ...minimap,
        [text]: obj
      }));
    }
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}
