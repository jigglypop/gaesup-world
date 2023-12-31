import { recipe } from "@vanilla-extract/recipes";
import { boxShadowHover } from "../constants/boxshadow.css.js";
import { palette } from "../constants/palette.css.js";
import { sprinkles } from "../sprinkles/index.css.js";
import { vars } from "../theme.css.js";
import { flex_relative } from "./index.css.js";

export const button = recipe({
  base: [
    flex_relative({}),
    {
      color: "white",
      textAlign: "center",
      borderRadius: "1rem",
      margin: "0.5rem",
      width: "100%",
      transition: "all 0.3s ease-in",
      cursor: "pointer",
    },
  ],
  variants: {
    purple: {
      true: {
        background: vars.gradient.purple,
        boxShadow: palette.purple800,
        ":hover": {
          boxShadow: boxShadowHover.purple800_hover,
        },
      },
    },
    gray: {
      true: {
        background: palette.gray800,
        boxShadow: palette.gray800,
        ":hover": {
          boxShadow: boxShadowHover.slate700_hover,
        },
      },
    },
    glass: {
      true: {
        color: vars.themes.text.normal,
        background: vars.themes.glass.normal,
        boxShadow: `0 0 5px ${vars.themes.glass.normal}`,
        ":hover": {
          boxShadow: `0 0 10px ${vars.themes.glass.normal}`,
        },
      },
    },
    black: {
      false: {
        background: palette.gray400,
      },
      true: {
        background: palette.gray800,
        color: palette.gray200,
      },
    },
  },
  compoundVariants: [
    {
      variants: {
        gray: true,
      },
      style: sprinkles({
        bs: { default: "gray900", hover: "slate700_hover" },
      }),
    },
  ],
});

export const mobileButton = recipe({
  base: [
    {
      width: "7.5rem",
      height: "4rem",
      borderRadius: "1rem",
      fontSize: "1rem",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
      boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
      cursor: "pointer",
      transition: "all 0.3s ease-in",
      margin: "0.5rem",
    },
  ],
  variants: {
    character: {
      true: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 1rem rgba(5,222,250,1)",
        color: "black",
        ":hover": {
          boxShadow: "0 0 2rem rgba(5,222,250,1)",
        },
      },
    },
    control: {
      true: {
        background: vars.gradient.red,
        boxShadow: "0 0 1rem rgba(245,177,97,1)",
        color: "black",
        ":hover": {
          boxShadow: "0 0 2rem rrgba(245,177,97,1)",
        },
      },
    },
  },
});
