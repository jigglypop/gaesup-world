import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import { airplaneColliderType } from "../../../world/context/type";

export const AirplaneCollider = forwardRef(
  ({ collider }: { collider: airplaneColliderType }, ref: Ref<Collider>) => {
    const { airplaneSizeX, airplaneSizeY, airplaneSizeZ } = collider;

    return (
      <CuboidCollider
        ref={ref}
        args={[airplaneSizeX / 2, airplaneSizeY / 2, airplaneSizeZ / 2]}
        position={[0, airplaneSizeY / 2, 0]}
      />
    );
  }
);
