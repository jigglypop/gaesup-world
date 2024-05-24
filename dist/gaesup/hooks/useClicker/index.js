import { useContext } from "react";
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, mode = _a.mode;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var moveClicker = function (e, isRun, type) {
        if (mode.controller !== "clicker" || type !== "ground")
            return;
        var u = activeState.position;
        var v = V3(e.point.x, e.point.y, e.point.z);
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
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
        moveClicker: moveClicker,
    };
}
