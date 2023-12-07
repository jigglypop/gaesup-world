import { Dispatch, useEffect } from "react";
import { gaesupWorldPropType } from "../../../stores/context";
import { getGltfResultType } from "./gltf";

export function vehicle(
  gltf: getGltfResultType,
  value: gaesupWorldPropType,
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>
) {
  const { url } = value;
  if (!url || !url.vehicleUrl) return;
  const { vehicleSize, wheelSize } = gltf;

  useEffect(() => {
    if (
      vehicleSize.x !== 0 &&
      vehicleSize.y !== 0 &&
      vehicleSize.z !== 0 &&
      wheelSize.x !== 0 &&
      wheelSize.y !== 0 &&
      wheelSize.z !== 0
    ) {
      dispatch({
        type: "update",
        payload: {
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
      });
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
