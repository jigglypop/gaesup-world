import { scDream } from "@styles/fonts.css";
import { buttonRecipe } from "@styles/recipe/button.css";
import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const updateGltfInfo = style([
  flex({ column: "10" }),
  {
    maxWidth: "20rem",
    padding: "1rem",
    margin: "1rem",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(1rem)",
    zIndex: 100,
  },
]);

export const selectNpcUnder = style([
  {
    position: "relative",
    width: "70rem",
    height: "14rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
]);

export const selectPartOuter = style([
  flex({ column: "10" }),
  {
    maxWidth: "20rem",
    height: "12rem",
    padding: "0.5rem",
    margin: "1rem",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(1rem)",
    zIndex: 100,
  },
]);

export const selectPart = style([
  {
    width: "15rem",
    height: "8rem",
    padding: "1rem",
    display: "grid",
    borderRadius: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    boxShadow: "0 0 1.5rem rgba(0, 0, 0, 0.6)",
    gridTemplateColumns: "repeat(10, 1fr)",
    overflowY: "hidden",
    overflowX: "scroll",
  },
]);

export const updateGltfButtonsInner = style([
  {
    width: "18rem",
    height: "10rem",
    overflowX: "hidden",
    padding: "1rem",
    display: "grid",
    borderRadius: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
    gridTemplateColumns: "repeat(2, 1fr)",
    overflowY: "scroll",
  },
]);

export const updateInputImage = style([flex({ row: "center" }), {}]);

export const tapButtons = style([
  {
    position: "absolute",
    zIndex: 100,
    top: "1rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
]);

export const gltfButton = style([
  buttonRecipe({ color: "mint" }),
  {
    fontSize: "1rem",
    margin: "0.3rem",
    padding: "0.3rem",
    width: "6.5rem",
    height: "3rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
    fontFamily: scDream,
    fontWeight: "800",
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

export const selectNpcLeft = style([
  flex({ column: "10" }),
  {
    position: "absolute",
    zIndex: 100,
    top: "2rem",
    left: "2rem",
    width: "20rem",
    height: "30rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontSize: "1.2rem",
    padding: "1rem",
    fontWeight: 600,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(1rem)",
  },
]);
