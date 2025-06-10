import { scDream } from "@styles/fonts.css";
import { flex, glass } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const leftSlider = style([
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "fixed",
    zIndex: 1000,
    top: "7rem",
    left: "1rem",
    minHeight: "10rem",
  },
]);

export const button = style([
  glass({}),
  flex({}),
  {
    width: "6rem",
    height: "3rem",
    margin: "0.5rem",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    transition: "all 0.3s ease-in",
    fontSize: "1.4rem",
    cursor: "pointer",
    fontFamily: scDream,
    fontWeight: 600,
  },
]);

export const tapButtons = style([
  {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
]);

export const gltfButton = style([
  {
    fontWeight: 600,
    width: "5rem",
    height: "3rem",
    fontFamily: scDream,
    fontSize: "1.2rem",
  },
]);

export const tilePicker = style([
  flex({ row: "center" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
  },
]);
export const titles = style([
  {
    position: "absolute",
    bottom: "1rem",
    left: "1rem",
    fontSize: "1.2rem",
    margin: "0.5rem",
    padding: "0.5rem",
    // color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
  },
]);

export const selectType = style([
  {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    display: "flex",

    fontFamily: scDream,
    fontSize: "1.5rem",
  },
]);

export const selectTile = style([
  {
    position: "fixed",
    top: "20rem",
    left: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
    borderRadius: "1rem",
    backdropFilter: "blur(1rem)",
    width: "40rem",
    fontFamily: scDream,
    fontSize: "1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "15rem 2fr",
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
    marginTop: "2rem",
    width: "20rem",
    height: "20rem",
    display: "grid",
    overflowY: "scroll",
    gridTemplateColumns: "repeat(5, 1fr)",
  },
]);

export const color = style([
  {
    gridAutoColumns: "1fr",
    position: "relative",
    width: "2rem",
    height: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.3rem",
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

export const changefButton = style([
  gltfButton,
  {
    width: "3rem",
  },
]);

export const selectNpc = style([
  {
    position: "fixed",
    top: "20rem",
    left: "2rem",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
    borderRadius: "1rem",
    backdropFilter: "blur(1rem)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "40rem",
    fontFamily: scDream,
    fontSize: "1.5rem",
  },
]);
