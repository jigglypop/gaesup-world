import { fontFace, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, flex, sprinkles } from "../styles";
import { vars } from "../styles/theme.css";

const BlackHanSans = fontFace({
  src: 'local("/public/fonts/BlackHanSans-Regular.ttf")',
});

export const keyBoardToolTipOuter = style([
  flex({
    column: "6",
  }),
  {
    position: "fixed",
    bottom: "0",
    left: "50%",
    transform: "translate(-50%, 0)",
    width: "45vw",
    height: "25vh",
  },
]);

export const minimapOuter = style([flex({})]);

export const gameBoyOuter = style([
  fixed({
    south_east: true,
  }),
  flex({
    column: "7",
  }),
  sprinkles({
    display: {
      desktop: "none",
      laptop: "none",
      tablet: "flex",
      mobile: "flex",
    },
  }),
  {
    width: "100%",
  },
]);

export const joystickOuter = style([
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
    height: "50rem",
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
    control: {
      true: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 1rem rgba(5,222,250,1)",
        color: "black",
        ":hover": {
          boxShadow: "0 0 3rem rgba(5,222,250,1)",
        },
      },
    },
  },
});

export const gamePad = style([
  {
    position: "fixed",
    marginRight: "5rem",
    width: "12rem",
    zIndex: 10000000,
  },
]);

export const jump = style([
  fixed({
    west: true,
  }),
  {
    marginRight: "5rem",
    width: "12rem",
    zIndex: 10000,
  },
]);
