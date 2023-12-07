import { useFrame } from "@react-three/fiber";
import { useRapier, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { GaesupWorldContext, gaesupWorldPropType } from "../stores/context";
import { propType } from "../type";

export default function checkOnTheSlope(prop: propType) {
  const { capsuleColliderRef, slopeRayOriginRef, slopeRay, groundRay } = prop;
  const { characterCollider: collider } =
    useContext<gaesupWorldPropType>(GaesupWorldContext);
  const { world } = useRapier();
  useFrame(() => {
    if (
      !slopeRayOriginRef.current ||
      !capsuleColliderRef.current ||
      !slopeRay.rayCast
    )
      return null;
    slopeRayOriginRef.current.getWorldPosition(slopeRay.origin);
    slopeRay.origin.y = groundRay.origin.y;

    slopeRay.hit = world.castRay(
      slopeRay.rayCast,
      slopeRay.length,
      true,
      undefined,
      undefined,
      capsuleColliderRef.current
    );

    // Calculate slope angle
    if (slopeRay.hit && groundRay.rayCast) {
      const castRayNormal = slopeRay.hit.collider.castRayAndGetNormal(
        groundRay.rayCast,
        slopeRay.length,
        false
      );
      if (castRayNormal) slopeRay.current = vec3(castRayNormal.normal);
    }
    if (
      slopeRay.hit &&
      groundRay.hit &&
      slopeRay.hit.toi < collider.radius + 0.3 + 0.5
    ) {
      slopeRay.angle = Number(
        Math.atan(
          (groundRay.hit.toi - slopeRay.hit.toi) / slopeRay.offset.z
        ).toFixed(2)
      );
    }
  });
}
