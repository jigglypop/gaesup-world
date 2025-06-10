import { gltfButton } from "@containers/leftSlider/styles.css";
import { scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const outer = style([
  flex({ column: "center" }),
  {
    position: "relative",
    width: "12rem",
    height: "12rem",
    overflow: "hidden",
  },
]);

export const right = style([
  flex({ column: "center" }),
  {
    gridRow: "1/2",
    gridColumn: "2/3",
    width: "100%",
    height: "100%",
  },
]);

export const selectColor = style([
  flex({ column: "10" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
    gridRow: "1 / 2",
    gridColumn: "1 / 3",
    fontFamily: scDream,
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.8)",
    padding: "2rem",
  },
]);

export const colors = style([
  {
    position: "relative",
    margin: "1rem",
    padding: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(1rem)",

    display: "grid",
    overflowY: "scroll",
    gridTemplateColumns: "repeat(4, 1fr)",

    width: "18rem",
    height: "8rem",
  },
]);

export const color = style([
  {
    gridAutoColumns: "1fr",
    gap: "0.5rem",
    gridAutoRows: "1fr",
    position: "relative",
    width: "2rem",
    height: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
]);
export const updateInputImage = style([
  flex({ row: "center" }),
  {
    position: "relative",
    gridColumn: "1 / 3",
  },
]);

export const title = style([
  {
    fontSize: "1.3rem",
    margin: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: "800",
  },
]);

export const changeButton = style([
  gltfButton,
  {
    width: "3rem",
  },
]);
