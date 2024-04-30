import { ThreeEvent } from "@react-three/fiber";
import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useClicker() {
  const { activeState, mode, clicker, clickerOption } =
    useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const moveClicker = (
    e: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: "normal" | "ground"
  ) => {
    if (mode.controller !== "clicker" || type !== "ground") return;
    const u = activeState.position;
    const v = V3(e.point.x, e.point.y, e.point.z);
    const norm = calcNorm(u, v, false);
    if (norm < 2) return;
    const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
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
  };

  const moveDoubleClicker = (
    e: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: "normal" | "ground"
  ) => {
    if (!clicker.isOn || !clickerOption.isRun) return;

    dispatch({
      type: "update",
      payload: {
        clicker: {
          ...clicker,
          isRun,
        },
      },
    });
  };

  return {
    moveClicker,
    moveDoubleClicker,
  };
}
