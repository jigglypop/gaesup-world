import { VECssType } from "../type";

export type gamepadType = {
  keyBoardLabel?: Record<string, string>;
} & {
  [key in
    | "gamepadButtonStyle"
    | "gamepadGridStyle"
    | "gamepadInnerStyle"
    | "gamepadStyle"]?: VECssType;
};
