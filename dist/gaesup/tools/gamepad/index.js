import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context/index.js";
import { GaesupToolsContext } from "../context.js";
import GamePadButton from "./GamePadButton.js";
import * as style from "./style.css";
export default function GamePad() {
    var _a = useContext(GaesupToolsContext), _b = _a.gamepad, gamepadStyle = _b.gamepadStyle, gamepadGridStyle = _b.gamepadGridStyle, keyBoardLabel = _a.keyboardToolTip.keyBoardLabel;
    var _c = useContext(GaesupWorldContext), control = _c.control, mode = _c.mode;
    var GamePadDirections = Object.keys(control)
        .map(function (key) {
        var name = (keyBoardLabel === null || keyBoardLabel === void 0 ? void 0 : keyBoardLabel[key]) || key;
        if (key !== "forward" &&
            key !== "backward" &&
            key !== "leftward" &&
            key !== "rightward")
            return {
                tag: key,
                value: key,
                name: name,
            };
    })
        .filter(function (item) { return item !== undefined; })
        .filter(function (item) {
        return !(item.tag === "run" && mode.controller === "joystick");
    });
    return (_jsx("div", { className: style.gamePad, children: _jsx("div", { className: style.gamePadGrid, children: GamePadDirections.map(function (item, key) {
                return (_jsx(GamePadButton, { value: item.value, name: item.name }, key));
            }) }) }));
}
