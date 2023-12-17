import { Collider } from "@dimforge/rapier3d-compat";
import { CapsuleCollider, useRapier } from "@react-three/rapier";
import { Ref, forwardRef, useContext } from "react";
import { controllerInnerType, groundRayType } from "../../../controller/type";
import { getRayHit, useForwardRef } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";

export const CharacterCapsuleCollider = forwardRef(
  ({ props }: { props: controllerInnerType }, ref: Ref<Collider>) => {
    const { characterCollider: collider } = useContext(GaesupWorldContext);
    const colliderRef = useForwardRef<Collider>(ref);
    const { rapier } = useRapier();
    const { groundRay, slopeRay } = props;
    groundRay.length = collider.radius + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit<groundRayType>({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();

    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);
    slopeRay.length = collider.radius + 3;
    slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);

    return (
      <CapsuleCollider ref={ref} args={[collider.height, collider.radius]} />
    );
  }
);
