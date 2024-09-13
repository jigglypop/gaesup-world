import { useRapier } from "@react-three/rapier";
import { getRayHit } from "../../../utils";
export function setGroundRay({ groundRay, length, colliderRef, }) {
    var _a;
    const { rapier } = useRapier();
    groundRay.length = length;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit({
        ray: groundRay,
        ref: colliderRef,
    });
    groundRay.parent = (_a = groundRay.hit) === null || _a === void 0 ? void 0 : _a.collider.parent();
}
