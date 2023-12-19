import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import { urlType, vehicleColliderType } from "../../../world/context/type";

export const VehicleCollider = forwardRef(
  (
    { collider, url }: { collider: vehicleColliderType; url: urlType },
    ref: Ref<Collider>
  ) => {
    const { vehicleSizeX, vehicleSizeY, vehicleSizeZ } = collider;
    return (
      <CuboidCollider
        ref={ref}
        args={[vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2]}
        position={[0, vehicleSizeY + url.wheelUrl ? collider.wheelSizeY : 0, 0]}
      />
    );
  }
);
