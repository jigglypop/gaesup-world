import { useRapier } from '@react-three/rapier';
import { useRayHit } from '../../../hooks/useRayHit';
import { setGroundRayType } from './type';

export function useSetGroundRay() {
  const { rapier } = useRapier();
  const getRayHit = useRayHit();
  const setGroundRay = ({ groundRay, length, colliderRef }: setGroundRayType) => {
    groundRay.length = length;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();
  };
  return setGroundRay;
}
