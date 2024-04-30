import { ThreeEvent } from "@react-three/fiber";
import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";

export function useClicker() {
  const { activeState, clicker, mode, refs } = useContext(GaesupWorldContext);
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
    const norm = calcNorm(u, v, false);
    // console.log(e, v);
    // refs.rigidBodyRef.current?.setLinvel(V3(10, 0, 10), true);
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
  };
  // // 거리 계산
  // useEffect(() => {
  //   if (mode.controller !== "clicker") return;
  //   const originPoint = activeState.position;
  //   const newPosition = clicker.point;
  //   const norm = Math.sqrt(
  //     Math.pow(newPosition.z - originPoint.z, 2) +
  //       Math.pow(newPosition.x - originPoint.x, 2)
  //   );
  //   if (norm < 1) {
  //     clicker.isOn = false;
  //     dispatch({
  //       type: "update",
  //       payload: {
  //         clicker: clicker,
  //       },
  //     });
  //   }
  // }, [activeState.position, clicker.point]);

  return {
    moveClicker,
  };
}
