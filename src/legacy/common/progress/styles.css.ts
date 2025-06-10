import { blackHanSans } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

export const fadeIn = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(-5rem)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const progressOuter = style([
  flex({}),
  {
    position: "fixed",
    zIndex: 1000000,
    width: "100vw",
    height: "100vh",
    background: vars.gradient.mint,
    fontFamily: blackHanSans,
    WebkitBackdropFilter: "blur(10px)",
  },
]);

export const title = style([
  {
    fontSize: "9rem",
    lineHeight: 1.2,
    padding: 0,
    color: "rgba(0, 0, 0, 0.5)",
    textShadow: "0 0 0.5rem rgba(25, 25, 25, 0.5)",
    fontFamily: blackHanSans,
    margin: 0,
    animation: `${fadeIn} 1s ease-in`,
    "@media": {
      "(max-width: 1024px)": {
        fontSize: "9rem",
      },
      "(max-width: 768px)": {
        fontSize: "8rem",
      },
      "(max-width: 600px)": {
        fontSize: "6rem",
      },
    },
  },
]);

export const subtitle = style([
  {
    fontSize: "3.5rem",
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
    color: "rgba(0, 0, 0, 0.5)",
    textShadow: "0 0 0.5rem rgba(25, 25, 25, 0.5)",
    fontFamily: blackHanSans,
    animation: `${fadeIn} 1.5s ease-in`,
    "@media": {
      "(max-width: 1024px)": {
        fontSize: "2.5rem",
      },
      "(max-width: 768px)": {
        fontSize: "2.5rem",
      },
      "(max-width: 600px)": {
        fontSize: "2rem",
      },
    },
  },
]);

export const loader = style([
  flex({
    column: "center",
  }),
  {
    position: "fixed",
    zIndex: 500,
    width: "100vw",
    height: "100vh",
  },
]);

export const progressDiv = style([
  flex({
    column: "center",
  }),
  {
    margin: "1.2rem",
    width: "22rem",
    padding: "1rem",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "1rem",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    WebkitBackdropFilter: "blur(10px)",
  },
]);
// 커밋
globalStyle(`${loader} p `, {
  margin: "0",
  padding: "0",
  fontSize: "2rem",
  color: "rgba(255, 255, 255, 0.8)",
  textShadow: "0 0 10px rgba(100, 100, 100, 0.6)",
  fontFamily: blackHanSans,

  "@media": {
    "(max-width: 1024px)": {
      fontSize: "2rem",
    },
  },
});

export const progressBar = style({
  overflow: "hidden",
  position: "relative",
  padding: "5px 0",
  width: "200px",
  height: "35px",
  transition: "all 0.3s ease-in",
});

export const progressGray = style({
  position: "absolute",
  transform: "translate(-200px, -100%)",
  top: "50%",
  width: "200px",
  height: "15px",
  background: "rgba(0, 0, 0, 0.5)",
  boxShadow: "0 0 0.2rem rgba(0, 0, 0, 0.5)",
});
