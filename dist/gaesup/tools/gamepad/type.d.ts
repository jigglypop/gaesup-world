import { VECssType } from "../type";
export type gamepadType = {
    label?: Record<string, string>;
} & {
    [key in "gamepadButtonStyle" | "gamepadGridStyle" | "gamepadInnerStyle" | "gamepadStyle"]?: Partial<VECssType>;
};
