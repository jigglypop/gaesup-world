import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupToolsContext } from "../context";
import GameBoyButton from "./GameBoyButton";
import * as style from "./style.css";
export var GameBoyDirections = [
    {
        tag: "up",
        value: "forward",
        icon: _jsx(_Fragment, {}),
    },
    { tag: "down", value: "backward", icon: _jsx(_Fragment, {}) },
    { tag: "left", value: "leftward", icon: _jsx(_Fragment, {}) },
    { tag: "right", value: "rightward", icon: _jsx(_Fragment, {}) },
];
export default function GameBoy() {
    var _a = useContext(GaesupToolsContext).gameboy, gameboyStyle = _a.gameboyStyle, gameboyInnerStyle = _a.gameboyInnerStyle;
    return (_jsx("div", { className: style.gameBoy, children: _jsx("div", { className: style.gameBoyInner, children: GameBoyDirections.map(function (item, key) {
                return (_jsx(GameBoyButton, { tag: item.tag, value: item.value, icon: item.icon }, key));
            }) }) }));
}
