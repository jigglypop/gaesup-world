import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import * as THREE from "three";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useMovePoint() {
  const { activeState, clicker } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const move = (position: THREE.Vector3, isRun: boolean) => {
    const u = activeState.position;
    const v = vec3(position);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    dispatch({
      type: "update",
      payload: {
        clicker: {
          ...clicker,
          point: V3(position.x, 0, position.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };

  return {
    move,
  };
}
