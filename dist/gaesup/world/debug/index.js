import { buttonGroup, useControls } from "leva";
import { useEffect } from "react";
import { update } from "../../utils/context";
export default function initDebug(_a) {
    var value = _a.value, dispatch = _a.dispatch;
    var debug = value.debug;
    if (!debug)
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
    useEffect(function () {
        update({
            mode: { type: type.type, controller: controller.controller },
        }, dispatch);
    }, [type, controller]);
}
