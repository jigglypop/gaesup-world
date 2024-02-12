import { ThreeEvent } from "@react-three/fiber";
import _ from "lodash";
import { useContext, useEffect } from "react";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export default function useClicker() {
  const { activeState, clicker, mode } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const moveClicker = (
    e: ThreeEvent<MouseEvent>,
    isRun: boolean,
    type: "normal" | "ground"
  ) => {
    if (mode.controller !== "clicker" || type !== "ground") return;
    const originPoint = activeState.position;
    const newPosition = e.point;
    const newAngle = Math.atan2(
      newPosition.z - originPoint.z,
      newPosition.x - originPoint.x
    );

    const norm = Math.sqrt(
      Math.pow(newPosition.z - originPoint.z, 2) +
        Math.pow(newPosition.x - originPoint.x, 2)
    );
    if (norm < 1) return;
    const dispatcher = _.debounce(() => {
      dispatch({
        type: "update",
        payload: {
          clicker: {
            point: V3(e.point.x, e.point.y, e.point.z),
            angle: newAngle,
            isOn: true,
            isRun: isRun,
          },
        },
      });
    }, 100);
    dispatcher();
    // dispatch({
    //   type: "update",
    //   payload: {
    //     clicker: {
    //       point: V3(e.point.x, e.point.y, e.point.z),
    //       angle: newAngle,
    //       isOn: true,
    //       isRun: isRun,
    //     },
    //   },
    // });
  };
  // const moveClicker = _.throttle(moveClick, 100);

  // 거리 계산
  useEffect(() => {
    if (mode.controller !== "clicker") return;
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
    moveClicker,
  };
}
