import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";
import { editorHeader } from "../header/styles.css";

export const editorFooter = style([
  editorHeader,
  flex({ row: "center" }),
  {
    justifyContent: "space-between",
    position: "sticky",
    bottom: 0,
  },
]);

globalStyle(`${editorFooter} p`, {
  fontSize: "1.4rem",
  margin: "0",
  padding: "0",
});
