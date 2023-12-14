import { jsx as _jsx } from "react/jsx-runtime";
import { useContext, useState } from "react";
import { GaesupToolsContext } from "../context.js";
import { usePushKey } from "../pushKey/index.js";
import * as style from "./style.css";
export default function GamePadButton(_a) {
    var value = _a.value, name = _a.name;
    var gamepadButtonStyle = useContext(GaesupToolsContext).gamepad.gamepadButtonStyle;
    var _b = useState(false), isClicked = _b[0], setIsClicked = _b[1];
    var pushKey = usePushKey().pushKey;
    var onMouseDown = function () {
        pushKey(value, true);
        setIsClicked(true);
    };
    var onMouseLeave = function () {
        pushKey(value, false);
        setIsClicked(false);
    };
    return (_jsx("button", { className: style.padButton({
            isClicked: isClicked,
        }), onMouseDown: function () { return onMouseDown(); }, onMouseUp: function () { return onMouseLeave(); }, onMouseLeave: function () { return onMouseLeave(); }, onContextMenu: function (e) {
            e.preventDefault();
            onMouseLeave();
        }, onPointerDown: function () { return onMouseDown(); }, onPointerUp: function () { return onMouseLeave(); }, children: name }));
}
