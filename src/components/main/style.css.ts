import { vars } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { fontFace } from "@vanilla-extract/css";

const BlackHanSans = fontFace({
  src: 'local("/public/fonts/BlackHanSans-Regular.ttf")',
});

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

export const mainButton = recipe({
  base: {
    width: "5rem",
    height: "5rem",
    borderRadius: "50%",
    fontSize: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
    transition: "all 0.3s ease-in",
    margin: "0.5rem",
    fontFamily: blackHanSans,
    fontWeight: "700",
    ":hover": {
      background: "rgba(0, 0, 0, 0.8)",
      boxShadow: "0 0 2rem rgba(0, 0, 0, 0.5)",
    },
  },
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
