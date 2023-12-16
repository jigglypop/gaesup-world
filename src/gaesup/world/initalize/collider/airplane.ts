import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
import { gaesupWorldContextType } from "../../context/type";
import { innerColliderPropType } from "../type";

export function airplane({ gltf, value, dispatch }: innerColliderPropType) {
  const { url } = value;
  if (!url || !url.airplaneUrl) return;
  const { airplaneSize } = gltf;

  useEffect(() => {
    if (isVectorNonZero(airplaneSize)) {
      update<gaesupWorldContextType>(
        {
          airplaneCollider: {
            airplaneSizeX: airplaneSize.x,
            airplaneSizeY: airplaneSize.y,
            airplaneSizeZ: airplaneSize.z,
            airplaneX: airplaneSize.x / 2,
            airplaneY: airplaneSize.y / 2,
            airplaneZ: airplaneSize.z / 2,
          },
        },
        dispatch
      );
    }
  }, [airplaneSize.x, airplaneSize.y, airplaneSize.z]);
}
