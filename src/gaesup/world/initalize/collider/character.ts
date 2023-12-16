import { useEffect } from "react";
import { isVectorNonZero } from "../../../utils";
import { update } from "../../../utils/context";
import { gaesupWorldContextType } from "../../context/type";
import { innerColliderPropType } from "../type";

export function character({ gltf, value, dispatch }: innerColliderPropType) {
  const { url } = value;
  if (!url || !url.characterUrl) return;
  const { characterSize } = gltf;
  useEffect(() => {
    if (isVectorNonZero(characterSize)) {
      const heightPlusDiameter = characterSize.y / 2;
      const diameter = Math.max(characterSize.x, characterSize.z);
      const radius = diameter / 2;
      const height = heightPlusDiameter - radius;
      const halfHeight = height / 2;
      update<gaesupWorldContextType>(
        {
          characterCollider: {
            height,
            halfHeight,
            radius,
            diameter,
          },
        },
        dispatch
      );
    }
  }, [characterSize.x, characterSize.y, characterSize.z]);
}
