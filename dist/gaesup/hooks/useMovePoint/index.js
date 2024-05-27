import { vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useMovePoint() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, clicker = _a.clicker;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var move = function (position, isRun) {
        var u = activeState.position;
        var v = vec3(position);
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
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
    return {
        move: move,
    };
}
