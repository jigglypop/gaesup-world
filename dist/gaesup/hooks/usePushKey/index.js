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
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function usePushKey() {
    var control = useContext(GaesupWorldContext).control;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var pushKey = function (key, value) {
        control[key] = value;
        dispatch({
            type: "update",
            payload: {
                control: __assign({}, control),
            },
        });
    };
    return {
        pushKey: pushKey,
    };
}
