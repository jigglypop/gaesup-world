import { jsx as _jsx } from "react/jsx-runtime";
import { usePushKey } from "../../hooks/usePushKey";
import "./style.css";
export default function GameBoyButton(_a) {
    var tag = _a.tag, value = _a.value, icon = _a.icon, gameboyButtonStyle = _a.gameboyButtonStyle;
    var pushKey = usePushKey().pushKey;
    var onMouseDown = function () {
        pushKey(value, true);
    };
    var onMouseLeave = function () {
        pushKey(value, false);
    };
    return (_jsx("button", { className: "gameboy-button ".concat(tag), onMouseDown: function () { return onMouseDown(); }, onMouseUp: function () { return onMouseLeave(); }, onMouseLeave: function () { return onMouseLeave(); }, onContextMenu: function (e) {
            e.preventDefault();
        }, onPointerDown: function () { return onMouseDown(); }, onPointerUp: function () { return onMouseLeave(); }, style: gameboyButtonStyle, children: icon }));
}
