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
import { useEffect } from "react";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { cameraOptionDebugMap } from "./cameraOption";
export default function initDebug(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var worldDebug = value.debug;
    if (!worldDebug)
        return;
    var cameraOptionValue = debug({
        debug: worldDebug,
        debugProps: value.cameraOption,
        tag: "cameraOption",
        debugMap: cameraOptionDebugMap,
    });
    useEffect(function () {
        update({
            cameraOption: __assign({}, cameraOptionValue),
        }, dispatch);
    }, [cameraOptionValue]);
}
