import { useContext, useEffect } from "react";
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export default function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, clicker = _a.clicker, mode = _a.mode;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var moveClicker = function (e, isRun) {
        if (mode.controller !== "clicker")
            return;
        var originPoint = activeState.position;
        var newPosition = e.point;
        var newAngle = Math.atan2(newPosition.z - originPoint.z, newPosition.x - originPoint.x);
        var norm = Math.sqrt(Math.pow(newPosition.z - originPoint.z, 2) +
            Math.pow(newPosition.x - originPoint.x, 2));
        if (norm < 1)
            return;
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
    };
    // 거리 계산
    useEffect(function () {
        if (mode.controller !== "clicker")
            return;
        var originPoint = activeState.position;
        var newPosition = clicker.point;
        var norm = Math.sqrt(Math.pow(newPosition.z - originPoint.z, 2) +
            Math.pow(newPosition.x - originPoint.x, 2));
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
        moveClicker: moveClicker,
    };
}
