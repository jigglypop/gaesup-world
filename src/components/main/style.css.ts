import { fontFace, style } from "@vanilla-extract/css";
import { mobileButton } from "../../styles/recipe/button.css";
import { vars } from "../../styles/theme.css";

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

export const button = style([
  mobileButton({}),
  {
    boxSizing: "border-box",
  },
]);
