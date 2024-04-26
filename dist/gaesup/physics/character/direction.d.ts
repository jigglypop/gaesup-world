import { joyStickInnerType } from "../../tools/joystick/type";
import { activeStateType, clickerType, modeType } from "../../world/context/type";
import { calcType } from "../type";
export declare function orbitDirection({ activeState, control, mode, joystick, clicker, }: {
    activeState: activeStateType;
    mode: modeType;
    joystick: joyStickInnerType;
    clicker: clickerType;
    control: {
        [key: string]: boolean;
    };
}): void;
export declare function normalDirection({ activeState, control, mode, joystick, clicker, }: {
    activeState: activeStateType;
    mode: modeType;
    joystick: joyStickInnerType;
    clicker: clickerType;
    control: {
        [key: string]: boolean;
    };
}): void;
export default function direction(prop: calcType): void;
