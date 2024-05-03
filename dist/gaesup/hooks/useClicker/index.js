var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useContext, useEffect } from "react";
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useClicker() {
    var _a = useContext(GaesupWorldContext), activeState = _a.activeState, mode = _a.mode, clicker = _a.clicker, clickerOption = _a.clickerOption;
    var dispatch = useContext(GaesupWorldDispatchContext);
    // autoStart
    useEffect(function () {
        if (clickerOption.autoStart) {
            var u = activeState.position;
            var v = clickerOption.queue.shift();
            if (clickerOption.loop) {
                clickerOption.queue.push(v);
            }
            var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
            clicker.angle = newAngle;
            clicker.point = V3(v.x, 0, v.z);
            clicker.isOn = true;
        }
        dispatch({
            type: "update",
            payload: {
                clicker: __assign({}, clicker),
                clickerOption: __assign({}, clickerOption),
            },
        });
    }, [clickerOption.autoStart]);
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
    var moveDoubleClicker = function (e, isRun, type) {
        if (!clicker.isOn || !clickerOption.isRun)
            return;
        dispatch({
            type: "update",
            payload: {
                clicker: __assign(__assign({}, clicker), { isRun: isRun }),
            },
        });
    };
    return {
        moveClicker: moveClicker,
        moveDoubleClicker: moveDoubleClicker,
    };
}
