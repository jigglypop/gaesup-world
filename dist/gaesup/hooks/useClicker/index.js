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
        var gap = calcNorm(v, clicker.point, true);
        if (gap < 1)
            return;
        var newAngle = Math.atan2(v.z - u.z, v.x - u.x);
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
