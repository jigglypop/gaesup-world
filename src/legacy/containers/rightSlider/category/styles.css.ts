import { scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const outer = style([
  {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "rgba(0, 0, 0, 0.6)",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(1rem)",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
  },
]);

export const title = style([
  {
    margin: "1rem",
    color: "rgba(255, 255, 255, 0.6)",
    textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
    fontSize: "1.5rem",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

export const subtitle = style([
  {
    margin: "1rem 1rem 0.5rem 1rem",
    color: "rgba(255, 255, 255, 0.6)",
    textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
    fontSize: "1.3rem",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

export const objectType = style([
  {
    position: "relative",
    width: "100%",
    minHeight: "3rem",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
  },
]);

export const category = style([
  {
    position: "relative",
    width: "100%",
    minHeight: "3rem",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
  },
]);
// 카테고리 버튼
export const categoryButton = style([
  {
    width: "5.5rem",
    height: "3rem",
    margin: "0.5rem",
    fontSize: "1.1rem",
  },
]);

export const list = style([
  flex({ column: "10" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
    fontFamily: scDream,
    fontSize: "1.2rem",

    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.6)",
    padding: "1rem",
  },
]);

globalStyle(`${list} p`, {
  margin: "0",
  padding: "0",
  lineHeight: "1.8",
  color: "rgba(255, 255, 255, 0.8)",
  textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
  fontFamily: scDream,
  fontWeight: 300,
  cursor: "pointer",
});
