/// <reference types="react" />
export type gameBoyButtonType = {
    tag: "up" | "down" | "left" | "right";
    value: string;
    icon: JSX.Element;
};
export default function GameBoyButton({ tag, value, icon }: gameBoyButtonType): import("react/jsx-runtime").JSX.Element;
