import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context/index.js";
import GamePadButton from "./GamePadButton.js";
import "./style.css";
export function GamePad(props) {
    var gamePadStyle = props.gamePadStyle, gamePadButtonStyle = props.gamePadButtonStyle, label = props.label;
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
    return (_jsx(_Fragment, { children: (mode.controller === "joystick" || mode.controller === "gameboy") && (_jsx("div", { className: "gamePad", style: gamePadStyle, children: GamePadDirections.map(function (item, key) {
                return (_jsx(GamePadButton, { value: item.value, name: item.name, gamePadButtonStyle: gamePadButtonStyle }, key));
            }) })) }));
}
