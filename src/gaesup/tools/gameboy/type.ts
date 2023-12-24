import { VECssType } from "../type";

export type gameboyType = {
  [key in "gameboyStyle" | "gameboyButtonStyle"]?: Partial<VECssType>;
};
