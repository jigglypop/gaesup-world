import { joyStickBallType, joyStickOriginType } from "./type.js";
export declare const joyStickBallDefault: {
    top: string;
    left: string;
};
export declare const joyStickOriginDefault: {
    x: number;
    y: number;
    angle: number;
    currentRadius: number;
    originRadius: number;
    isIn: boolean;
    isOn: boolean;
    isUp: boolean;
    isCenter: boolean;
};
export declare const joyStickInnerDefault: {
    on: boolean;
    joyStickBall: {
        top: string;
        left: string;
    };
    joyStickOrigin: {
        x: number;
        y: number;
        angle: number;
        currentRadius: number;
        originRadius: number;
        isIn: boolean;
        isOn: boolean;
        isUp: boolean;
        isCenter: boolean;
    };
};
export declare const joyStickDefault: {
    on: boolean;
};
export default function useJoyStick(): {
    joyStickOrigin: joyStickOriginType;
    joyStickBall: joyStickBallType;
    setBall: (ball: joyStickBallType) => void;
    setOrigin: (origin: joyStickOriginType) => void;
};
