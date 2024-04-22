import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePushKey } from "../../hooks/usePushKey";
import "./style.css";
export default function GamePadButton(_a) {
    var value = _a.value, name = _a.name, gamePadButtonStyle = _a.gamePadButtonStyle;
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
    return (_jsx("button", { className: "padButton ".concat(isClicked ? "isClicked" : ""), onMouseDown: function () { return onMouseDown(); }, onMouseUp: function () { return onMouseLeave(); }, onMouseLeave: function () { return onMouseLeave(); }, onContextMenu: function (e) {
            e.preventDefault();
            onMouseLeave();
        }, onPointerDown: function () { return onMouseDown(); }, onPointerUp: function () { return onMouseLeave(); }, style: gamePadButtonStyle, children: name }));
}
