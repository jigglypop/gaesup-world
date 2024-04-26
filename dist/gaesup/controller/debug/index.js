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
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { GaesupWorldContext } from "../../world/context";
import { airplaneDebugMap } from "./airplane";
import { characterDebugMap } from "./character";
import { vehicleDebugMap } from "./vehicle";
export default function initDebug(_a) {
    var controllerContext = _a.controllerContext, controllerDispatch = _a.controllerDispatch;
    var worldDebug = useContext(GaesupWorldContext).debug;
    if (!worldDebug)
        return;
    var characterOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.character,
        tag: "character",
        debugMap: characterDebugMap,
    });
    var vehicleOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.vehicle,
        tag: "vehicle",
        debugMap: vehicleDebugMap,
    });
    var airplaneOptionValue = debug({
        debug: worldDebug,
        debugProps: controllerContext.airplane,
        tag: "airplane",
        debugMap: airplaneDebugMap,
    });
    useEffect(function () {
        update({
            character: __assign({}, characterOptionValue),
            vehicle: __assign({}, vehicleOptionValue),
            airplane: __assign({}, airplaneOptionValue),
        }, controllerDispatch);
    }, [characterOptionValue, vehicleOptionValue, airplaneOptionValue]);
}
