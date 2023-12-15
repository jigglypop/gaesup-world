import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../context/reducer";
import { innerColliderPropType } from "../type";

export function vehicle({ gltf, value, dispatch }: innerColliderPropType) {
  const { url } = value;
  if (!url || !url.vehicleUrl) return;
  const { vehicleSize, wheelSize } = gltf;
  useEffect(() => {
    if (isVectorNonZero(vehicleSize) && isVectorNonZero(wheelSize)) {
      update(
        {
          vehicleCollider: {
            vehicleSizeX: vehicleSize.x,
            vehicleSizeY: wheelSize.y,
            vehicleSizeZ: vehicleSize.z,
            wheelSizeX: wheelSize.x,
            wheelSizeY: wheelSize.y,
            wheelSizeZ: wheelSize.z,
            vehicleX: vehicleSize.x / 2,
            vehicleY: wheelSize.y / 2,
            vehicleZ: vehicleSize.z / 2,
          },
        },
        dispatch
      );
    }
  }, [
    vehicleSize.x,
    vehicleSize.y,
    vehicleSize.z,
    wheelSize.x,
    wheelSize.y,
    wheelSize.z,
  ]);
}
