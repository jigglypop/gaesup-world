import { Collider } from '@dimforge/rapier3d-compat';
import { useRapier } from '@react-three/rapier';
import { RefObject } from 'react';
import { groundRayType } from '../controller/type';

export const getRayHit = ({ ray, ref }: { ray: groundRayType; ref: RefObject<Collider> }) => {
  const { world } = useRapier();
  return world.castRay(
    ray.rayCast,
    ray.length,
    true,
    undefined,
    undefined,
    ref.current as any,
    undefined,
  );
};
