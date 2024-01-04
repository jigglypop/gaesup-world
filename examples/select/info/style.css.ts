import { fontFace, globalStyle, style } from "@vanilla-extract/css";
import { flex, flex_fixed, glass } from "../styles/recipe/index.css";

export const NanumSquareEB = fontFace([
  {
    src: 'url("./fonts/NanumSquareEB.ttf") format("truetype")',
  },
]);

export const modal = style([
  flex_fixed({
    north_west: true,
  }),
  {
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(0, 0, 0, 0.4)",
    zIndex: "9999",
  },
]);

export const infoStyle = style([
  flex_fixed({
    north_west: true,
  }),
  glass({}),
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "flex-start",
    top: "1rem",
    left: "1rem",
    borderRadius: "2rem",
    color: "white",
    zIndex: "10",
    padding: "1rem",
    width: "30rem",
    height: "30rem",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    boxShadow: "0 0 10px rgba(0, 0, 0)",
  },
]);

globalStyle(`${infoStyle} hr`, {
  width: "100%",
  border: "1px solid rgba(0, 0, 0, 0.5)",
});

export const text = style([
  {
    margin: "1rem",
    fontSize: "2rem",
    color: "black",
    fontFamily: NanumSquareEB,
  },
]);
export const small = style([
  {
    margin: "0.5rem",
    fontSize: "1.2rem",
    color: "black",
    fontFamily: NanumSquareEB,
  },
]);

export const infoInner = style([
  flex({ row: "9" }),
  {
    width: "100%",
    background: "rgba(0, 0, 0, 0.4)",
    color: "white",
    fontFamily: NanumSquareEB,
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
