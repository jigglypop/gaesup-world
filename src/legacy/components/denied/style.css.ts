import { blackHanSans } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const denied = style([
  flex({
    column: "center",
  }),
  {
    width: "100%",
    height: "100%",
    color: "rgba(0, 0, 0, 0.8)",
    textShadow: "0 0 10px #000",
    transition: "all 0.2s ease-in",
    background: "transparent",
  },
]);

globalStyle(`${denied} h1`, {
  fontSize: "12rem",
  lineHeight: "1.2",
  fontFamily: blackHanSans,
  margin: 0,
  padding: 0,
});

globalStyle(`${denied} h2`, {
  fontSize: "8rem",
  lineHeight: "1.2",
  fontFamily: blackHanSans,
  margin: 0,
  padding: 0,
});

globalStyle(`${denied} p`, {
  fontSize: "2rem",
  textShadow: "0 0 0px #000",
  fontWeight: "400",
  margin: 0,
  padding: 0,
});

export const buttons = style([
  flex({
    row: "center",
  }),
]);
