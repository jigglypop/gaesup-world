import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
import {
  gaesupWorldContextType,
  vehicleColliderType,
} from "../../context/type";
import { innerColliderPropType } from "../type";

export function vehicle({ gltf, value, dispatch }: innerColliderPropType) {
  const { url } = value;
  if (!url || !url.vehicleUrl) return;
  const { vehicleSize, wheelSize } = gltf;
  useEffect(() => {
    if (isVectorNonZero(vehicleSize)) {
      const vehicleCollider: vehicleColliderType = {
        vehicleSizeX: vehicleSize.x,
        vehicleSizeZ: vehicleSize.z,
        vehicleX: vehicleSize.x / 2,
        vehicleZ: vehicleSize.z / 2,
      };
      if (url.wheelUrl && isVectorNonZero(wheelSize)) {
        vehicleCollider.vehicleSizeY = wheelSize.y;
        vehicleCollider.vehicleY = wheelSize.y / 2;
        vehicleCollider.wheelSizeX = wheelSize.x;
        vehicleCollider.wheelSizeY = wheelSize.y;
        vehicleCollider.wheelSizeZ = wheelSize.z;
        update<gaesupWorldContextType>(
          {
            vehicleCollider: {
              ...vehicleCollider,
            },
          },
          dispatch
        );
      } else {
        vehicleCollider.vehicleSizeY = vehicleSize.y;
        vehicleCollider.vehicleY = vehicleSize.y;
        update<gaesupWorldContextType>(
          {
            vehicleCollider: {
              ...vehicleCollider,
            },
          },
          dispatch
        );
      }
    }
  }, [vehicleSize.x, vehicleSize.y, vehicleSize.z, wheelSize]);
}
