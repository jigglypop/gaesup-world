import { CSSProperties } from "react";
import "./style.css";
export type joyStickType = {
    [key in "joyStickBallStyle" | "joyStickStyle"]?: CSSProperties;
};
export declare function JoyStick(props: joyStickType): import("react/jsx-runtime").JSX.Element;
