import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import GamePadButton from "./GamePadButton";
import "./style.css";
export const gamepadDefault = {
    on: true,
};
export function GamePad(props) {
    const { gamePadStyle, gamePadButtonStyle, label } = props;
    const { control, mode } = useContext(GaesupWorldContext);
    const GamePadDirections = Object.keys(control)
        .map((key) => {
        const name = (label === null || label === void 0 ? void 0 : label[key]) || key;
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
        .filter((item) => item !== undefined)
        .filter((item) => !(item.tag === "run"));
    return (_jsx(_Fragment, { children: mode.controller === "clicker" && (_jsx("div", { className: "gamePad", style: gamePadStyle, children: GamePadDirections.map((item, key) => {
                return (_jsx(GamePadButton, { value: item.value, name: item.name, gamePadButtonStyle: gamePadButtonStyle }, key));
            }) })) }));
}
