import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { MutableRefObject } from "react";
import { rayType } from "../controller/type";

export const getRayHit = <T extends rayType>({
  ray,
  ref,
}: {
  ray: T;
  ref: MutableRefObject<Collider>;
}) => {
  const { world } = useRapier();
  return world.castRay(
    ray.rayCast,
    ray.length,
    true,
    undefined,
    undefined,
    ref.current,
    undefined
  );
};
