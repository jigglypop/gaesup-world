import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export const VehicleCollider = forwardRef((_, ref: Ref<Collider>) => {
  const { vehicleCollider: collider } = useContext(GaesupWorldContext);
  const { vehicleSizeX, vehicleSizeY, vehicleSizeZ } = collider;
  return (
    <CuboidCollider
      ref={ref}
      args={[vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2]}
      position={[0, vehicleSizeY / 2, 0]}
    />
  );
});
