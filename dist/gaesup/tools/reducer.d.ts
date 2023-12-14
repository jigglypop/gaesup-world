import { gaesupToolsPropType } from "./type";
export declare function gaesupToolsReducer(props: gaesupToolsPropType, action: {
    type: string;
    payload?: gaesupToolsPropType;
}): {
    keyboardToolTip: import("./keyBoardToolTip/type").keyBoardToolTipType;
    joystick: import("./joystick/type").joyStickType;
    minimap: import("./minimap/type").minimapType;
    gameboy: import("./gameboy/type").gameboyType;
    gamepad: import("./gamepad/type").gamepadType;
};
