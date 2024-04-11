import { Collider } from "@dimforge/rapier3d-compat";
import { CuboidCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import * as THREE from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlsType } from "../../../world/context/type";

export const VehicleWheelCollider = forwardRef(
  (
    { urls, vehicleSize }: { urls: urlsType; vehicleSize: THREE.Vector3 },
    ref: Ref<Collider>
  ) => {
    const { size: wheelSize } = useGltfAndSize({
      url: urls.wheelUrl,
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
