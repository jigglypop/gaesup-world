import { Collider } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { RefObject } from "react";
import { groundRayType } from "../../../controller/type";
import { getRayHit } from "../../../utils";

export type setGroundRayType = {
  groundRay: groundRayType;
  length: number;
  colliderRef: RefObject<Collider>;
};

export function setGroundRay({
  groundRay,
  length,
  colliderRef,
}: setGroundRayType) {
  const { rapier } = useRapier();
  groundRay.length = length;
  groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
  groundRay.hit = getRayHit<groundRayType>({
    ray: groundRay,
    ref: colliderRef,
  });
  groundRay.parent = groundRay.hit?.collider.parent();
}
