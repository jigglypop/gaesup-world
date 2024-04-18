import { useContext, useEffect } from "react";
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useMovePoint() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, clicker = _a.clicker;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var move = function (position, isRun) {
        var originPoint = activeState.position;
        var newAngle = Math.atan2(position.z - originPoint.z, position.x - originPoint.x);
        var norm = Math.sqrt(Math.pow(position.z - originPoint.z, 2) +
            Math.pow(position.x - originPoint.x, 2));
        if (norm < 2)
            return;
        dispatch({
            type: "update",
            payload: {
                clicker: {
                    point: V3(position.x, 0, position.z),
                    angle: newAngle,
                    isOn: true,
                    isRun: isRun,
                },
            },
        });
    };
    // 거리 계산
    useEffect(function () {
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
        move: move,
    };
}
