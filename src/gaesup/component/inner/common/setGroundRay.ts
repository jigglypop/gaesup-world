import { useRapier } from '@react-three/rapier';
import { useRaycast } from '../../../utils/physics';
import { setGroundRayType } from './types';

export function useSetGroundRay() {
  const { rapier } = useRapier();
  const { castRay } = useRaycast();
  const setGroundRay = ({ groundRay, length, colliderRef }: setGroundRayType) => {
    groundRay.length = length;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = castRay({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();
  };
  return setGroundRay;
}
