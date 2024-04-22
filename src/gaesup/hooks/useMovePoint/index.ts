import { useContext, useEffect } from "react";
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
    const originPoint = activeState.position;
    const newAngle = Math.atan2(
      position.z - originPoint.z,
      position.x - originPoint.x
    );

    const norm = Math.sqrt(
      Math.pow(position.z - originPoint.z, 2) +
        Math.pow(position.x - originPoint.x, 2)
    );
    if (norm < 2) return;
    dispatch({
      type: "update",
      payload: {
        clicker: {
          point: V3(position.x, 0, position.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };
  // 거리 계산
  useEffect(() => {
    const originPoint = activeState.position;
    const newPosition = clicker.point;
    const norm = Math.sqrt(
      Math.pow(newPosition.z - originPoint.z, 2) +
        Math.pow(newPosition.x - originPoint.x, 2)
    );
    if (norm < 1) {
      clicker.isOn = false;
      dispatch({
        type: "update",
        payload: {
          clicker: clicker,
        },
      });
    }
  }, [activeState.position, clicker.point]);

  return {
    move,
  };
}
