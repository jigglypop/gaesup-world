import { useRapier } from "@react-three/rapier";
import { groundRayType } from "../../../controller/type";
import { getRayHit } from "../../../utils";
import { setGroundRayType } from "./type";

/*

  @ setGroundRay
  // 그라운드 레이캐스터를 설정합니다.
*/
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
