import { blackHanSans } from "@styles/fonts.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const NotFound = style({
  position: "relative",
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "5rem",
  margin: "0",
  padding: "0",
  lineHeight: "21%",
  fontFamily: blackHanSans,
});

globalStyle(`${NotFound} > h1 `, {
  fontSize: "8rem",
  fontFamily: blackHanSans,
});
