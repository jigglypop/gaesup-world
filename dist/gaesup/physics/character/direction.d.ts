import { RootState } from "@react-three/fiber";
import { joyStickInnerType } from "../../tools/joystick/type";
import { activeStateType, modeType } from "../../world/context/type";
import { calcPropType } from "../type";
export declare function joystickDirection(): void;
export declare function orbitDirection({ activeState, control, mode, joystick, state, }: {
    state: RootState;
    activeState: activeStateType;
    mode: modeType;
    joystick: joyStickInnerType;
    control: {
        [key: string]: boolean;
    };
}): void;
export declare function normalDirection({ activeState, control, mode, joystick, state, }: {
    state: RootState;
    activeState: activeStateType;
    mode: modeType;
    joystick: joyStickInnerType;
    control: {
        [key: string]: boolean;
    };
}): void;
export default function direction(prop: calcPropType): void;
