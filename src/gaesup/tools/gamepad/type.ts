import { CSSProperties } from "react";

export type gamepadType = {
  label?: Record<string, string>;
} & {
  [key in
    | "gamePadButtonStyle"
    | "gamePadStyle"
    | "gamePadInnerStyle"]?: CSSProperties;
};
