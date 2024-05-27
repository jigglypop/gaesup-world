import { ThreeEvent } from "@react-three/fiber";
import { useContext } from "react";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useClicker() {
  const { activeState, mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const moveClicker = (
    e: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: "normal" | "ground"
  ) => {
    if (mode.controller !== "clicker" || type !== "ground") return;
    const u = activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
    dispatch({
      type: "update",
      payload: {
        clicker: {
          point: V3(v.x, 0, v.z),
          angle: newAngle,
          isOn: true,
          isRun: isRun,
        },
      },
    });
  };

  return {
    moveClicker,
  };
}
