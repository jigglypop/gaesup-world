import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import * as THREE from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";

export const VehicleWheelCollider = forwardRef(
  (
    { wheelUrl, vehicleSize }: { wheelUrl: string; vehicleSize: THREE.Vector3 },
    ref: Ref<Collider>
  ) => {
    const { size: wheelSize } = useGltfAndSize({
      url: wheelUrl,
    });

    return (
      <CuboidCollider
        ref={ref}
        args={[
          vehicleSize.x / 2,
          vehicleSize.y / 2 - wheelSize.y / 2,
          vehicleSize.z / 2,
        ]}
        position={[0, vehicleSize.y / 2 + wheelSize.y / 2, 0]}
      />
    );
  }
);

export const VehicleCollider = forwardRef(
  ({ vehicleSize }: { vehicleSize: THREE.Vector3 }, ref: Ref<Collider>) => {
    return (
      <CuboidCollider
        ref={ref}
        args={[vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2]}
        position={[0, vehicleSize.y / 2, 0]}
      />
    );
  }
);
