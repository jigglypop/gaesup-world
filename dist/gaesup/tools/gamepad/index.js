import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from "react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { GaesupWorldContext } from "../../world/context/index.js";
import GamePadButton from "./GamePadButton.js";
import * as style from "./style.css";
export function GamePad(props) {
    var gamepadStyle = props.gamepadStyle, gamepadGridStyle = props.gamepadGridStyle, gamepadButtonStyle = props.gamepadButtonStyle, label = props.label;
    var _a = useContext(GaesupWorldContext), control = _a.control, mode = _a.mode;
    var GamePadDirections = Object.keys(control)
        .map(function (key) {
        var name = (label === null || label === void 0 ? void 0 : label[key]) || key;
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
    return (_jsx(_Fragment, { children: (mode.controller === "joystick" || mode.controller === "gameboy") && (_jsx("div", { className: style.gamePad, style: assignInlineVars(gamepadStyle), children: _jsx("div", { className: style.gamePadGrid, style: assignInlineVars(gamepadGridStyle), children: GamePadDirections.map(function (item, key) {
                    return (_jsx(GamePadButton, { value: item.value, name: item.name, gamepadButtonStyle: gamepadButtonStyle }, key));
                }) }) })) }));
}
