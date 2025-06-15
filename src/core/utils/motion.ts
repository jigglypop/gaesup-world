import { Collider } from '@dimforge/rapier3d-compat';
import { useRapier } from '@react-three/rapier';
import { RefObject, useCallback } from 'react';
import { GroundRayType } from '../../types';

export function createRaycastHook() {
  return function useRaycast() {
    const { world } = useRapier();
    const castRay = useCallback(
      ({ ray, ref }: { ray: GroundRayType; ref: RefObject<Collider> }) =>
        ray.rayCast
          ? world.castRay(
              ray.rayCast,
              ray.length,
              true,
              undefined,
              undefined,
              ref.current || undefined,
            )
          : null,
      [world],
    );

    const castRayFromPosition = useCallback(
      (
        origin: { x: number; y: number; z: number },
        direction: { x: number; y: number; z: number },
        maxDistance: number,
      ) => world.castRay({ origin, dir: direction }, maxDistance, true),
      [world],
    );
    return { castRay, castRayFromPosition };
  };
}

export const useRaycast = createRaycastHook();
