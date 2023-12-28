import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";

export const AirplaneCollider = forwardRef(
  ({ airplaneSize }: { airplaneSize: THREE.Vector3 }, ref: Ref<Collider>) => {
    return (
      <CuboidCollider
        ref={ref}
        args={[airplaneSize.x / 2, airplaneSize.y / 2, airplaneSize.z / 2]}
        position={[0, airplaneSize.y / 2, 0]}
      />
    );
  }
);
