import { CSSProperties } from "react";
import "./style.css";
export type gameBoyButtonType = {
    tag: "up" | "down" | "left" | "right";
    value: string;
    icon: JSX.Element;
    gameboyButtonStyle: CSSProperties;
};
export default function GameBoyButton({ tag, value, icon, gameboyButtonStyle, }: gameBoyButtonType): import("react/jsx-runtime").JSX.Element;
