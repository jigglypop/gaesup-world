import { blackHanSans, nanumSquareB } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

export const fly = keyframes({
  "0%": {
    transform: "rotate(0) translate(8rem) rotate(0)",
  },
  "100%": {
    transform: "rotate(-1turn) translate(8rem) rotate(1turn)",
  },
});

export const auth = style([
  flex({ column: "center" }),
  {
    position: "relative",
    padding: "10rem 2rem 2rem 2rem",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
    overflowX: "hidden",
    overflowY: "scroll",
    "@media": {
      "(max-width: 768px)": {
        padding: "10rem 1rem 1rem 1rem",
      },
    },
  },
]);

export const forms = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  transform: "all 0.5s ease-in-out",
  margin: "2rem",
  "@media": {
    "(max-width: 768px)": {
      width: "30rem",
    },
  },
});

export const Title = style({
  fontSize: "8rem",
  margin: 0,
  padding: 0,
  lineHeight: "1",
  fontFamily: blackHanSans,
  color: "rgba(255, 255, 255, 0.8)",
});

export const loginTitle = style({
  fontSize: "5rem",
  margin: 0,
  padding: 0,
  fontFamily: blackHanSans,
  color: "rgba(255, 255, 255, 0.8)",
});

export const discription = style({
  textAlign: "left",
  margin: "0.5rem",
  fontSize: "1.3rem",
  color: "rgba(255, 255, 255, 0.8)",
});

export const form = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "40rem",
});

export const toggle = style({
  marginTop: "2rem",
  color: "#b8a8ff",
  fontSize: "1.2rem",
  fontWeight: "800",
});

export const fieldOuter = style([
  {
    position: "relative",
    width: "100%",
  },
]);

export const field = style([
  inputRecipe({
    white: true,
  }),
  {
    position: "relative",
    padding: "1rem",
    margin: "0.2rem",
    verticalAlign: "middle",
    fontSize: "1.5rem",
    color: "rgba(255, 255, 255, 0.6)",
    selectors: {
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
]);

export const errorDiv = style({
  height: "2rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.2rem",
  color: "rgba(255, 255, 255, 0.8)",
});

export const toggleAuth = style([
  flex({ row: "center" }),
  {
    fontFamily: nanumSquareB,
    fontSize: "1.4rem",
    margin: "1rem",
    transition: "all 0.3s ease-in",
  },
]);

globalStyle(`${toggleAuth} span`, {
  color: "white",
  fontWeight: "400",
  cursor: "pointer",
});

export const errorMsg = style({
  fontSize: "1.2rem",
  lineHeight: "1.2",
  color: "#ff594e",
  fontFamily: nanumSquareB,
  opacity: 0.8,
});

export const under = style({
  position: "relative",
  width: "100%",
  height: "100%",
});

export const underInner = style([flex({ row: "center" })]);

export const underButton = style({
  minWidth: "10rem",
  maxHeight: "6rem",
  padding: "2rem",
  fontSize: "1.8rem",
  fontWeight: "600",
  textShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
});
