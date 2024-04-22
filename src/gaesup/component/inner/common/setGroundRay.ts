import { useRapier } from "@react-three/rapier";
import { groundRayType } from "../../../controller/type";
import { getRayHit } from "../../../utils";
import { setGroundRayType } from "./type";

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
