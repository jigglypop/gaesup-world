import { Collider } from '@dimforge/rapier3d-compat';
import { useRapier } from '@react-three/rapier';
import { RefObject, useCallback } from 'react';
import { GroundRayType } from '../../../types';

export function useRayHit() {
  const rapier = useRapier();
  const getRayHit = useCallback(
    ({ ray, ref }: { ray: GroundRayType; ref: RefObject<Collider> }) => {
      if (!ray.rayCast) return null;
      return rapier.world.castRay(
        ray.rayCast,
        ray.length,
        true,
        undefined,
        undefined,
        ref.current || undefined,
        undefined,
      );
    },
    [rapier],
  );
  return getRayHit;
}
