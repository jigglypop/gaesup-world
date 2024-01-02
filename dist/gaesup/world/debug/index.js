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
import { buttonGroup, useControls } from "leva";
import { useEffect } from "react";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { cameraOptionDebugMap } from "./cameraOption";
export default function initDebug(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var worldDebug = value.debug;
    if (!worldDebug)
        return;
    var _b = useControls(function () { return ({
        type: value.mode.type,
        " ": buttonGroup({
            character: function () { return setType({ type: "character" }); },
            airplane: function () { return setType({ type: "airplane" }); },
            vehicle: function () { return setType({ type: "vehicle" }); },
        }),
    }); }), type = _b[0], setType = _b[1];
    var _c = useControls(function () { return ({
        controller: value.mode.controller,
        "  ": buttonGroup({
            joystick: function () { return controllerSet({ controller: "joystick" }); },
            keyboard: function () { return controllerSet({ controller: "keyboard" }); },
            gameboy: function () { return controllerSet({ controller: "gameboy" }); },
        }),
    }); }), controller = _c[0], controllerSet = _c[1];
    var cameraOptionValue = debug({
        debug: worldDebug,
        debugProps: value.cameraOption,
        tag: "cameraOption",
        debugMap: cameraOptionDebugMap,
    });
    useEffect(function () {
        update({
            mode: {
                type: type.type,
                controller: controller.controller,
                control: value.mode.control,
            },
            cameraOption: __assign({}, cameraOptionValue),
        }, dispatch);
    }, [type, controller, cameraOptionValue]);
}
