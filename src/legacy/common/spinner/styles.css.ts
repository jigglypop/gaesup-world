import { globalStyle, keyframes, style } from "@vanilla-extract/css";

const rotate = keyframes({
  from: {
    transform: "rotate(0turn)",
  },
  to: {
    transform: "rotate(-1turn)",
  },
});

const outline = keyframes({
  "0%": {
    strokeDashoffset: "0",
  },
  "50%": {
    strokeDashoffset: "300",
  },
  "100%": {
    strokeDashoffset: "600",
  },
});

export const spinner = style({
  zIndex: "8",
  position: "fixed",
  top: "0",
  left: "0",
  width: "100vw",
  height: "100vh",
});

export const text = style({
  fontFamily: "var(--do-hyeon)",
  color: "white",
});

export const spinnerInner = style({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

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
