import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const canvas = style([
  {
    position: "fixed",
    width: "100vw",
    height: "100vh",
    top: 0,
    left: 0,
  },
]);

export const overlay = style([
  flex({
    column: "center",
  }),
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "10rem",
    zIndex: 10,
  },
]);
