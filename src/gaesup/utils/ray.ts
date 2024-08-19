import { useRapier } from "@react-three/rapier";
import { MutableRefObject } from "react";
import { rayType } from "../controller/type";

// @ts-ignore
export const getRayHit = <T extends rayType>({
  ray,
  ref,
}: {
  ray: any;
  ref: MutableRefObject<any>;
}) => {
  const { world } = useRapier() as any;
  return world.castRay(
    ray.rayCast,
    ray.length,
    true,
    undefined,
    undefined,
    ref.current as any,
    undefined
  );
};
