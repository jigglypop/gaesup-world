import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { RefObject, useCallback } from "react";
import { groundRayType } from "../../controller/type";

export function useRayHit() {
  const rapier = useRapier();

  const getRayHit = useCallback(
    ({ ray, ref }: { ray: groundRayType; ref: RefObject<Collider> }) => {
      return rapier.world.castRay(
        ray.rayCast,
        ray.length,
        true,
        undefined,
        undefined,
        ref.current as any,
        undefined
      );
    },
    [rapier]
  );

  return getRayHit;
}
