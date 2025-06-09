import { Collider } from '@dimforge/rapier3d-compat';
import { useRapier } from '@react-three/rapier';
import { RefObject, useCallback } from 'react';
import { GroundRayType } from '../../types';

export function createRaycastHook() {
  return function useRaycast() {
    const rapier = useRapier();
    const castRay = useCallback(
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

    const castRayFromPosition = useCallback(
      (
        origin: { x: number; y: number; z: number },
        direction: { x: number; y: number; z: number },
        maxDistance: number,
      ) => {
        const ray = { origin, dir: direction };
        return rapier.world.castRay(ray, maxDistance, true);
      },
      [rapier],
    );

    return {
      castRay,
      castRayFromPosition,
    };
  };
}

// 기존 useRayHit 호환성을 위한 함수
export const useRaycast = createRaycastHook();
