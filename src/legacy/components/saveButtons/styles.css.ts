import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const outer = style([
  flex({}),
  {
    position: "fixed",
    maxWidth: "18rem",
    borderRadius: "1rem",
  },
]);
