import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useMemo, useReducer } from "react";
import { GaesupWorldContext } from "../world/context";
import { GaesupToolsContext, GaesupToolsDispatchContext } from "./context";
import GameBoy from "./gameboy";
import { gameboyDefault } from "./gameboy/default";
import GamePad from "./gamepad";
import { gamepadDefault } from "./gamepad/default";
import JoyStick from "./joystick";
import { joyStickDefault } from "./joystick/default";
import KeyBoardToolTip from "./keyBoardToolTip";
import { keyboardToolTipDefault } from "./keyBoardToolTip/default";
import MiniMap from "./minimap";
import { minimapDefault } from "./minimap/default";
import { gaesupToolsReducer } from "./reducer";
import * as style from "./style.css";
export function GaeSupTools(_a) {
    var keyboardToolTip = _a.keyboardToolTip, joystick = _a.joystick, minimap = _a.minimap, gameboy = _a.gameboy, gamepad = _a.gamepad;
    var worldContext = useContext(GaesupWorldContext);
    var mode = worldContext.mode;
    var _b = useReducer(gaesupToolsReducer, {
        keyboardToolTip: Object.assign(keyboardToolTipDefault, keyboardToolTip || {}),
        joystick: Object.assign(joyStickDefault, joystick || {}),
        minimap: Object.assign(minimapDefault, minimap || {}),
        gameboy: Object.assign(gameboyDefault, gameboy || {}),
        gamepad: Object.assign(gamepadDefault, gamepad || {}),
    }), tools = _b[0], toolsDispatch = _b[1];
    var gaesupTool = useMemo(function () { return ({
        value: tools,
        dispatch: toolsDispatch,
    }); }, [
        tools.keyboardToolTip,
        tools.joystick,
        tools.minimap,
        tools.gameboy,
        tools.gamepad,
    ]);
    return (_jsx(GaesupToolsContext.Provider, { value: gaesupTool.value, children: _jsx(GaesupToolsDispatchContext.Provider, { value: gaesupTool.dispatch, children: _jsxs("div", { className: style.footer, children: [_jsx("div", { className: style.footerUpper, children: (mode.controller === "joystick" ||
                            mode.controller === "gameboy") &&
                            gaesupTool.value.gamepad.on && _jsx(GamePad, {}) }), _jsxs("div", { className: style.footerLower, children: [mode.controller === "joystick" && gaesupTool.value.joystick.on && (_jsx(JoyStick, {})), mode.controller === "gameboy" && gaesupTool.value.gameboy.on && (_jsx(GameBoy, {})), mode.controller === "keyboard" &&
                                gaesupTool.value.keyboardToolTip.on && _jsx(KeyBoardToolTip, {}), gaesupTool.value.minimap.on && _jsx(MiniMap, {})] })] }) }) }));
}
