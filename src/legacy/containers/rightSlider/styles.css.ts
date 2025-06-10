import { style } from "@vanilla-extract/css";

export const rightSlider = style([
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    position: "fixed",
    zIndex: 1000,
    top: "7rem",
    right: "1rem",
    minWidth: "10rem",
    minHeight: "10rem",
  },
]);
