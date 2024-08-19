import { CSSProperties } from "react";
export type gameboyType = {
    [key in "gameboyStyle" | "gameboyButtonStyle"]?: CSSProperties;
};
