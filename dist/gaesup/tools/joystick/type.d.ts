import { VECssType } from "../type";
export type joyStickBallType = {
    left: string;
    top: string;
};
export type joyStickOriginType = {
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
export type joyStickInnerType = {
    joyStickBall?: joyStickBallType;
    joyStickOrigin?: joyStickOriginType;
};
export type joyStickType = {
    [key in "joyStickBallStyle" | "joyStickStyle" | "joyBallStyle"]?: Partial<VECssType>;
};
