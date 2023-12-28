import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";

export const VehicleCollider = forwardRef(
  (
    {
      vehicleSize,
      wheelSize,
    }: {
      vehicleSize: THREE.Vector3;
      wheelSize: THREE.Vector3;
    },
    ref: Ref<Collider>
  ) => {
    return (
      <CuboidCollider
        ref={ref}
        args={[vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2]}
        position={[0, vehicleSize.y + wheelSize.y || 0, 0]}
      />
    );
  }
);
