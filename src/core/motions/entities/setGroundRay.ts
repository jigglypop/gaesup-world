import { RapierCollider } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import { GroundRayType } from '../../../types';

type setGroundRayType = {
  groundRay: GroundRayType;
  length: number;
  colliderRef: RefObject<RapierCollider>;
};

export function useSetGroundRay() {
  return ({ groundRay, length, colliderRef }: setGroundRayType) => {
    if (!colliderRef.current || !groundRay) return;
    if (!groundRay.origin || !groundRay.dir) return;
    const raycaster = new THREE.Raycaster();
    raycaster.set(groundRay.origin, groundRay.dir);
    raycaster.far = length;
    const intersections = raycaster.intersectObjects([], true);
    if (intersections.length > 0) {
      colliderRef.current.setActiveEvents(1);
    }
  };
}
