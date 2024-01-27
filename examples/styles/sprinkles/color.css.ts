import { defineProperties } from "@vanilla-extract/sprinkles";
import { boxShadow, boxShadowHover } from "../constants/boxshadow.css.js";
import {
  palette,
  rgba,
  theme,
  themeShadow,
  themeShadowHover,
} from "../constants/palette.css.js";
import { gradient } from "../recipe/index.css.js";

const paletteTheme = { ...palette, ...theme, ...rgba };
const paletteThemeGradient = { ...palette, ...theme, ...gradient, ...rgba };
const boxShadows = {
  ...boxShadow,
  ...boxShadowHover,
  ...themeShadow,
  ...themeShadowHover,
};

export const colorProperties = defineProperties({
  conditions: {
    default: {},
    hover: { selector: "&:hover" },
    active: { selector: "&:active" },
    focus: { selector: "&:focus" },
  },
  defaultCondition: "default",
  properties: {
    color: paletteTheme,
    backgroundColor: paletteThemeGradient as any,
    background: paletteThemeGradient as any,
    boxShadow: boxShadows,
    tranCursor: {
      true: {
        transition: "all 0.3s ease-in",
        cursor: "pointer",
      },
    },
    opacity: [
      "0",
      "0.1",
      "0.2",
      "0.3",
      "0.4",
      "0.5",
      "0.6",
      "0.7",
      "0.8",
      "0.9",
      "1",
    ],
  },
  shorthands: {
    bg: ["background"],
    bgc: ["backgroundColor"],
    c: ["color"],
    bs: ["boxShadow"],
    tc: ["tranCursor"],
    op: ["opacity"],
  },
});
