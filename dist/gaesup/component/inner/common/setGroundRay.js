import { useRapier } from "@react-three/rapier";
import { getRayHit } from "../../../utils";
/*

  @ setGroundRay
  // 그라운드 레이캐스터를 설정합니다.
*/
export function setGroundRay(_a) {
    var _b;
    var groundRay = _a.groundRay, length = _a.length, colliderRef = _a.colliderRef;
    var rapier = useRapier().rapier;
    groundRay.length = length;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
        ray: groundRay,
        ref: colliderRef,
    });
    groundRay.parent = (_b = groundRay.hit) === null || _b === void 0 ? void 0 : _b.collider.parent();
}
