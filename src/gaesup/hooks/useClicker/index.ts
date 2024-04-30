import { ThreeEvent } from "@react-three/fiber";
import { throttle } from "lodash";
import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useClicker() {
  const { activeState, clicker, mode, clickerOption } =
    useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const moveClicker = throttle(
    (e: ThreeEvent<MouseEvent>, isRun: boolean, type: "normal" | "ground") => {
      if (mode.controller !== "clicker" || type !== "ground") return;
      const u = activeState.position;
      const v = V3(e.point.x, e.point.y, e.point.z);
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      const norm = calcNorm(u, v, false);
      if (norm < 2) return;
      dispatch({
        type: "update",
        payload: {
          clicker: {
            point: v,
            angle: newAngle,
            isOn: true,
            isRun: isRun,
          },
        },
      });
    },
    clickerOption.throttle || 500
  );

  return {
    moveClicker,
  };
}
