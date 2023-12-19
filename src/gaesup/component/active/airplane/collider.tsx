import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider, useRapier } from "@react-three/rapier";
import { Ref, forwardRef, useContext } from "react";
import { controllerInnerType, groundRayType } from "../../../controller/type";
import { getRayHit, useForwardRef } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";

export const AirplaneCollider = forwardRef(
  ({ props }: { props: controllerInnerType }, ref: Ref<Collider>) => {
    const { airplaneCollider: collider } = useContext(GaesupWorldContext);
    const { airplaneSizeX, airplaneSizeY, airplaneSizeZ } = collider;

    const colliderRef = useForwardRef<Collider>(ref);
    const { rapier } = useRapier();
    const { groundRay } = props;
    groundRay.length = airplaneSizeY * 5 + 2;
    groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
    groundRay.hit = getRayHit<groundRayType>({
      ray: groundRay,
      ref: colliderRef,
    });
    groundRay.parent = groundRay.hit?.collider.parent();

    return (
      <CuboidCollider
        ref={ref}
        args={[airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2]}
        position={[0, airplaneSizeY / 2, 0]}
      />
    );
  }
);
