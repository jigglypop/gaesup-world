import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import {
  fixed,
  flex,
  flex_relative,
  glass,
  grid,
} from "../../../styles/recipe/index.css.js";
import { vars } from "../../../styles/theme.css.js";

export const gameBoy = style([
  fixed({
    south: true,
  }),
  flex({
    column: "7",
  }),
  {
    width: "100%",
  },
]);

export const gameBoyInner = style([
  grid({
    row: "center",
  }),
  {
    margin: "5rem",
    padding: "1rem",
    borderRadius: "50%",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr 1fr",
    background: "rgba(0, 0, 0, 0.5)",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  },
]);

export const gameBoyButtonRecipe = recipe({
  base: [
    flex_relative({}),
    glass({}),
    {
      all: "unset",
      width: "3rem",
      height: "3rem",
      margin: "0.3rem",
      borderRadius: "50%",
      background: vars.gradient.green,
      boxShadow: "0 0 10px #78ffd6",
      fontSize: "1.6rem",
      color: "black",
      textShadow: "0 0 10px black",
      cursor: "pointer",
      transition: "all 0.3s ease-in",
    },
  ],
  variants: {
    tag: {
      up: {
        gridRow: "1/2",
        gridColumn: "2/3",
      },
      left: {
        gridRow: "2/3",
        gridColumn: "1/2",
      },
      down: {
        gridRow: "3/4",
        gridColumn: "2/3",
      },
      right: {
        gridRow: "2/3",
        gridColumn: "3/4",
      },
    },
    direction: {
      up: {
        background: vars.gradient.green,
        boxShadow: "0 0 10px #78ffd6",
      },
      down: {
        background: vars.gradient.green,
        boxShadow: "0 0 10px #78ffd6",
      },
      left: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 10px rgba(176,255,237,1)",
      },
      right: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 10px rgba(176,255,237,1)",
      },
    },
  },
});
