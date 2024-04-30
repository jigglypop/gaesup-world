import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, clicker = _a.clicker, mode = _a.mode, refs = _a.refs;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var moveClicker = function (e, isRun, type) {
        if (mode.controller !== "clicker" || type !== "ground")
            return;
        var u = activeState.position;
        var v = V3(e.point.x, e.point.y, e.point.z);
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        var norm = calcNorm(u, v, false);
        // console.log(e, v);
        // refs.rigidBodyRef.current?.setLinvel(V3(10, 0, 10), true);
        if (norm < 2)
            return;
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
        moveClicker: moveClicker,
    };
}
