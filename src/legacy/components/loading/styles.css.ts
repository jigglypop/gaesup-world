import { scDream } from "@styles/fonts.css";
import { outline, rotate } from "@styles/keyframes/keyframes.css";
import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const spinner = style({
  zIndex: 10000000,
  position: "fixed",
  background: "rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
});

export const text = style({
  color: "rgba(255,255,255,0.8)",
  fontSize: "3rem",
  fontFamily: scDream,
  fontWeight: 800,
  textShadow: "0 0 5px rgba(255, 255, 255, 0.8)",
});

export const spinnerInner = style([
  flex({ column: "center" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
]);

export const svgWrapper = style({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  transform: "scale(2)",
});

globalStyle(`${svgWrapper} svg`, {
  width: "50%",
  maxWidth: "10rem",
  animation: `${rotate} 3.6s linear infinite`,
});

globalStyle(`${svgWrapper} circle`, {
  fill: "none",
  stroke: "white",
  strokeWidth: "8px",
  strokeDasharray: "300",
  animation: `${outline} 2s cubic-bezier(0.77, 0, 0.18, 1) infinite`,
});
