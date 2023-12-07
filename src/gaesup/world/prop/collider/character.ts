import { Dispatch, useEffect } from "react";
import { gaesupWorldPropType } from "../../../stores/context";
import { getGltfResultType } from "./gltf";

export function character(
  gltf: getGltfResultType,
  value: gaesupWorldPropType,
  dispatch: Dispatch<{
    type: string;
    payload?: Partial<gaesupWorldPropType>;
  }>
) {
  const { url } = value;
  if (!url || !url.characterUrl) return;
  const { characterGltf, characterSize } = gltf;
  useEffect(() => {
    if (
      characterSize.x !== 0 &&
      characterSize.y !== 0 &&
      characterSize.z !== 0
    ) {
      const heightPlusDiameter = characterSize.y / 2;
      const diameter = Math.max(characterSize.x, characterSize.z);
      const radius = diameter / 2;
      const height = heightPlusDiameter - radius;
      const halfHeight = height / 2;
      dispatch({
        type: "update",
        payload: {
          characterCollider: {
            height,
            halfHeight,
            radius,
            diameter,
          },
        },
      });
    }
  }, [characterSize.x, characterSize.y, characterSize.z]);
}
