import * as THREE from 'three';
import { setGroundRayType } from './types';

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
