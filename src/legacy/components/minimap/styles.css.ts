import { blackHanSans } from "@styles/fonts.css";
import { fixed } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const rotate = style([
  {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "5rem",
    zIndex: 1000,
    color: "rgba(255,255,255,0.6)",
  },
]);

export const minimapOuter = style([
  fixed({
    west: true,
  }),
  {
    bottom: "1rem",
    left: "1rem",
    zIndex: 1000,
    cursor: "pointer",
    "@media": {
      "(max-width: 768px)": {
        bottom: "6rem",
      },
    },
  },
]);

export const minimapAngle = style([
  {
    position: "absolute",
    width: "14rem",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    fontSize: "1.4rem",
    padding: "0.5rem",
    color: "rgba(255,255,255,0.8)",
    borderRadius: "1rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
    fontFamily: blackHanSans,
  },
]);
