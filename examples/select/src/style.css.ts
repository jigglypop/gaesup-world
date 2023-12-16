import { fontFace, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, flex } from "../../../src/styles/recipe/index.css";
import { vars } from "../../../src/styles/theme.css";

const BlackHanSans = fontFace({
  src: 'local("/public/fonts/BlackHanSans-Regular.ttf")',
});

export const minimapOuter = style([
  fixed({
    north_west: true,
  }),
]);

export const gameBoyOuter = style([
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

export const joyStickOuter = style([
  {
    position: "fixed",
    bottom: "5lvh",
    left: "5lvw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    textAlign: "center",
    width: "100%",
  },
]);

export const footer = style([
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "25rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

export const footerUpper = style([
  {
    gridColumn: "1/4",
    gridRow: "1/2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
]);

export const footerLower = style([
  {
    gridColumn: "1/4",
    gridRow: "2/3",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
]);

export const blackHanSans = style({
  fontFamily: BlackHanSans,
});

export const main = style([
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: vars.gradient.lightGreen,
    fontFamily: blackHanSans,
  },
]);

export const mainButtonContainer = style([
  {
    position: "fixed",
    zIndex: 100,
    top: "1rem",
    left: "1rem",
    display: "grid",
    flexDirection: "row",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
  },
]);

export const button = recipe({
  base: [
    {
      boxSizing: "border-box",
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
    selected: {
      true: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 1rem rgba(5,222,250,1)",
        color: "black",
        ":hover": {
          boxShadow: "0 0 2rem rgba(5,222,250,1)",
        },
      },
    },
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
