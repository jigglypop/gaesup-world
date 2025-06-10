import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const header = style([
  flex({
    row: "center",
  }),
  {
    fontSize: "1.4rem",
    color: vars.themes.text.normal,
    transition: "all 0.2s ease-in",
    background: "transparent",
  },
]);

globalStyle(`${header} p`, {
  margin: "1rem",
});
