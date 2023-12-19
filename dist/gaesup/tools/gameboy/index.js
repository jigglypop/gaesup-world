import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
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
export function GameBoy(props) {
    var mode = useContext(GaesupWorldContext).mode;
    var gameboyStyle = props.gameboyStyle, gameboyButtonStyle = props.gameboyButtonStyle;
    return (_jsx(_Fragment, { children: mode.controller === "gameboy" && (_jsx("div", { className: style.gameBoy, style: assignInlineVars(gameboyStyle), children: GameBoyDirections.map(function (item, key) {
                return (_jsx(GameBoyButton, { tag: item.tag, value: item.value, icon: item.icon, gameboyButtonStyle: gameboyButtonStyle }, key));
            }) })) }));
}
