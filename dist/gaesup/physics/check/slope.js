import { vec3 } from "@react-three/rapier";
export default function slope(prop) {
    var capsuleColliderRef = prop.capsuleColliderRef, slopeRayOriginRef = prop.slopeRayOriginRef, slopeRay = prop.slopeRay, groundRay = prop.groundRay, worldContext = prop.worldContext, world = prop.world;
    var collider = worldContext.characterCollider;
    if (!slopeRayOriginRef.current ||
        !capsuleColliderRef.current ||
        !slopeRay.rayCast)
        return null;
    slopeRayOriginRef.current.getWorldPosition(slopeRay.origin);
    slopeRay.origin.y = groundRay.origin.y;
    slopeRay.hit = world.castRay(slopeRay.rayCast, slopeRay.length, true, undefined, undefined, capsuleColliderRef.current);
    if (slopeRay.hit && groundRay.rayCast) {
        var castRayNormal = slopeRay.hit.collider.castRayAndGetNormal(groundRay.rayCast, slopeRay.length, false);
        if (castRayNormal)
            slopeRay.current = vec3(castRayNormal.normal);
    }
    if (slopeRay.hit &&
        groundRay.hit &&
        slopeRay.hit.toi < collider.radius + 0.3 + 0.5) {
        slopeRay.angle = Number(Math.atan((groundRay.hit.toi - slopeRay.hit.toi) / slopeRay.offset.z).toFixed(2));
    }
}
