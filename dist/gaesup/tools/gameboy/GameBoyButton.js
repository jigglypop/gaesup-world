import { jsx as _jsx } from "react/jsx-runtime";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { usePushKey } from "../pushKey/index.js";
import * as style from "./style.css";
export default function GameBoyButton(_a) {
    var tag = _a.tag, value = _a.value, icon = _a.icon, gameboyButtonStyle = _a.gameboyButtonStyle;
    var pushKey = usePushKey().pushKey;
    var onMouseDown = function () {
        pushKey(value, true);
    };
    var onMouseLeave = function () {
        pushKey(value, false);
    };
    return (_jsx("button", { className: "".concat(style.gameBoyButtonRecipe({
            tag: tag,
            direction: tag,
        })), onMouseDown: function () { return onMouseDown(); }, onMouseUp: function () { return onMouseLeave(); }, onMouseLeave: function () { return onMouseLeave(); }, onContextMenu: function (e) {
            e.preventDefault();
        }, onPointerDown: function () { return onMouseDown(); }, onPointerUp: function () { return onMouseLeave(); }, style: assignInlineVars(gameboyButtonStyle), children: icon }));
}
