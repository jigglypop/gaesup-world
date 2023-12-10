import { useEffect } from "react";
import { innerColliderPropType } from "../type";

export function airplane({ gltf, value, dispatch }: innerColliderPropType) {
  const { url } = value;
  if (!url || !url.airplaneUrl) return;
  const { airplaneSize } = gltf;

  useEffect(() => {
    if (airplaneSize.x !== 0 && airplaneSize.y !== 0 && airplaneSize.z !== 0) {
      dispatch({
        type: "update",
        payload: {
          airplaneCollider: {
            airplaneSizeX: airplaneSize.x,
            airplaneSizeY: airplaneSize.y,
            airplaneSizeZ: airplaneSize.z,
            airplaneX: airplaneSize.x / 2,
            airplaneY: airplaneSize.y / 2,
            airplaneZ: airplaneSize.z / 2,
          },
        },
      });
    }
  }, [airplaneSize.x, airplaneSize.y, airplaneSize.z]);
}
