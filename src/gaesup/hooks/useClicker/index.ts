import { ThreeEvent } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useClicker() {
  const { activeState, mode, clicker, clickerOption } =
    useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  // autoStart
  useEffect(() => {
    if (clickerOption.autoStart) {
      const u = activeState.position;
      const v = clickerOption.queue.shift();
      if (clickerOption.loop) {
        clickerOption.queue.push(v);
      }
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      clicker.angle = newAngle;
      clicker.point = V3(v.x, 0, v.z);
      clicker.isOn = true;
    }
    dispatch({
      type: "update",
      payload: {
        clicker: {
          ...clicker,
        },
        clickerOption: {
          ...clickerOption,
        },
      },
    });
  }, [clickerOption.autoStart]);

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
