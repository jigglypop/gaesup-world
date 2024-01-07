import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, flex } from "../styles/recipe/index.css";

const Roboto = "'Roboto', sans-serif;";
export const infoStyle = style([
  fixed({
    north_west: true,
  }),
  {
    display: "flex",
    flexDirection: "row",
    justifyContent: "between",
    top: "0",
    left: "0",
    color: "white",
    zIndex: "10",
    width: "100%",
    height: "6rem",
  },
]);

export const infoInnerStyle = style([
  flex({ row: "9" }),
  {
    width: "100%",
    color: "white",
  },
]);

export const text = style([
  flex({ column: "center" }),
  {
    margin: "0 1rem",
    padding: 0,
    fontSize: "2rem",
    color: "black",
    fontFamily: Roboto,
  },
]);

globalStyle(`${text} p`, {
  fontWeight: "700",
  margin: 0,
  padding: 0,
});

export const small = style([
  {
    margin: "0.5rem",
    fontSize: "1.2rem",
    color: "black",
  },
]);

export const infoInner = style([
  flex({ row: "9" }),
  {
    width: "100%",
    color: "white",
  },
]);

export const cameraLeft = style([
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    textAlign: "center",
    width: "100%",
  },
]);

export const pRecipe = recipe({
  base: {
    color: "white",
  },
  variants: {
    selected: {
      false: {
        color: "white",
      },
      true: {
        color: "rgba(99,251,215,1)",
      },
    },
  },
});

export const glassButton = style([
  {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: "0.5rem",
    fontSize: "1rem",
    borderRadius: "50%",
    width: "4.5rem",
    height: "4.5rem",
    color: "white",
    background: "rgba(0, 0, 0, 0.6)",
    boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.6)",
    transition: "all 0.2s ease-in",
    cursor: "pointer",
    fontWeight: "300",
    fontFamily: Roboto,

    ":hover": {
      background: "rgba(0, 0, 0, 0.8)",
      boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.8)",
    },
  },
]);
