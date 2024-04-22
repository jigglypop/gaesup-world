import { CSSProperties } from "react";
import "./style.css";
export type gamePadButtonType = {
    value: string;
    name: string;
    gamePadButtonStyle: CSSProperties;
};
export default function GamePadButton({ value, name, gamePadButtonStyle, }: gamePadButtonType): import("react/jsx-runtime").JSX.Element;
