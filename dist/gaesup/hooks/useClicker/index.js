import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, mode = _a.mode, clicker = _a.clicker, clickerOption = _a.clickerOption;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var moveClicker = function (e, isRun, type) {
        if (mode.controller !== "clicker" || type !== "ground")
            return;
        var u = activeState.position;
        var v = V3(e.point.x, e.point.y, e.point.z);
        var norm = calcNorm(u, v, false);
        if (norm < 2)
            return;
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        clicker.point = v;
        clicker.angle = newAngle;
        clicker.isOn = true;
        clicker.isRun = isRun;
        // dispatch({
        //   type: "update",
        //   payload: {
        //     clicker: {
        //       point: v,
        //       angle: newAngle,
        //       isOn: true,
        //       isRun: isRun,
        //     },
        //   },
        // });
    };
    var moveDoubleClicker = function (e, isRun, type) {
        if (!clicker.isOn || !clickerOption.isRun)
            return;
        clicker.isRun = isRun;
        // dispatch({
        //   type: "update",
        //   payload: {
        //     clicker: {
        //       point: v,
        //       angle: newAngle,
        //       isOn: true,
        //       isRun: isRun,
        //     },
        //   },
        // });
    };
    return {
        moveClicker: moveClicker,
        moveDoubleClicker: moveDoubleClicker,
    };
}
