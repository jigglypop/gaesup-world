import { throttle } from "lodash";
import { useContext } from "react";
import { V3, calcNorm } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, clicker = _a.clicker, mode = _a.mode, clickerOption = _a.clickerOption;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var moveClicker = throttle(function (e, isRun, type) {
        if (mode.controller !== "clicker" || type !== "ground")
            return;
        var u = activeState.position;
        var v = V3(e.point.x, e.point.y, e.point.z);
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        var norm = calcNorm(u, v, false);
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
    }, clickerOption.throttle || 500);
    return {
        moveClicker: moveClicker,
    };
}
