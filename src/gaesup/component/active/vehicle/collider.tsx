import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
export const VehicleCollider = forwardRef((_, ref: Ref<Collider>) => {
  const { vehicleCollider: collider, url } = useContext(GaesupWorldContext);
  const { vehicleSizeX, vehicleSizeY, vehicleSizeZ } = collider;
  return (
    <>
      {url.wheelUrl ? (
        <CuboidCollider
          ref={ref}
          args={[vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2]}
          position={[0, vehicleSizeY + collider.wheelSizeY / 2, 0]}
        />
      ) : (
        <CuboidCollider
          ref={ref}
          args={[vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2]}
          position={[0, vehicleSizeY, 0]}
        />
      )}
    </>
  );
});
