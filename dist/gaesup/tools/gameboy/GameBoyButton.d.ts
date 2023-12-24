/// <reference types="react" />
import { VECssType } from "../type.js";
export type gameBoyButtonType = {
    tag: "up" | "down" | "left" | "right";
    value: string;
    icon: JSX.Element;
    gameboyButtonStyle: Partial<VECssType>;
};
export default function GameBoyButton({ tag, value, icon, gameboyButtonStyle, }: gameBoyButtonType): import("react/jsx-runtime").JSX.Element;
