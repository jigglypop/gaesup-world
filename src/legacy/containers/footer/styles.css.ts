import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const footer = style([
  flex({ column: "center" }),
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "10rem",
    zIndex: 10,
    overflow: "hidden",
    "@media": {
      "(max-width: 768px)": {
        bottom: "6rem",
      },
    },
  },
]);
