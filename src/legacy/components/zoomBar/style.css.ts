import { blackHanSans } from "@styles/fonts.css";
import { flex, glass } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { style } from "@vanilla-extract/css";

export const zoomBarOuter = style([
  {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
  },
]);

export const bar = style([
  {
    display: "flex",
    width: "24rem",
    height: "3rem",
    background: "rgba(0,0,0,0.5)",
    borderRadius: "1.5rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },
]);

export const zoomText = style([
  glass({}),
  {
    position: "fixed",
    bottom: "6rem",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.8)",
    textShadow: "0 0 10px rgba(255,255,255,0.8)",
    fontSize: "1.8rem",
    margin: "0.5rem",
    fontFamily: blackHanSans,
    background: "rgba(0,0,0,0.7)",
    padding: "0.5rem 1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.7)",
  },
]);

export const zoomBall = style([
  flex({
    row: "center",
  }),
  {
    fontSize: "3rem",
    color: "rgba(0,0,0,0.6)",
    width: "4.5rem",
    height: "4.5rem",
    borderRadius: "50%",
    background: vars.gradient.mint,
    boxShadow: "0 0 10px rgba(99,251,215,1)",
    border: "none",
    cursor: "pointer",
    outline: "none",
    ":focus": {
      background: vars.gradient.cherryBlossom,
      boxShadow: "0 0 10px #fecfef",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
]);
