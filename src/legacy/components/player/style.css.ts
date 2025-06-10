import { pulse, pulseWhite } from "@styles/keyframes/keyframes.css";
import { fixed, flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const header = style([
  flex({
    row: "center",
  }),
  {
    width: "100%",
    height: "4rem",
    fontSize: "1.5rem",
    borderRadius: "1rem",
    background: "#000000",
    opacity: 0.5,
    padding: "1rem",
    transition: "all 5s ease-in-out",
  },
]);

export const headerBorder = style([
  {
    position: "absolute",
    width: "100%",
    height: "4rem",
    fontSize: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 0 0 0 #000000",
    transition: "all 5s ease-in-out",
    animation: `${pulse} 2s infinite`,
  },
]);

globalStyle(`${headerBorder} p`, {
  visibility: "hidden",
});

export const headerInner = style([
  flex({
    row: "9",
  }),
  {
    position: "relative",
    width: "100%",
    height: "4rem",
    fontSize: "1.5rem",
    borderRadius: "1rem",
    justifyContent: "flex-start",
    margin: 0,
    padding: 0,
  },
]);

export const border = style([
  {
    width: "6rem",
    height: "6rem",
    borderRadius: "50%",
    boxShadow: "0 0 0 0 #f4ffd4",
    animation: `${pulseWhite} 1.2s infinite`,
  },
]);

export const keyBoardToolTipOuter = style([
  fixed({
    south_east: true,
  }),
  flex({}),
  {
    bottom: "1rem",
    right: "1rem",
    overflow: "hidden",
    "@media": {
      "(max-width: 768px)": {
        bottom: "6rem",
      },
    },
  },
]);

export const minimapOuter = style([
  fixed({
    west: true,
  }),
  {
    bottom: "1rem",
    left: "1rem",
    "@media": {
      "(max-width: 768px)": {
        bottom: "6rem",
      },
    },
  },
]);

export const footer = style([
  flex({
    column: "center",
  }),
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "10rem",
    zIndex: 10,
  },
]);

export const footerUpper = style([
  {
    gridColumn: "1/4",
    gridRow: "1/2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
]);

export const footerLower = style([
  {
    gridColumn: "1/4",
    gridRow: "2/3",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
]);

export const overlay = style([
  flex({
    column: "center",
  }),
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "10rem",
    zIndex: 10,
  },
]);

export const main = style([
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
]);

export const mainButtonContainer = style([
  {
    position: "fixed",
    zIndex: 100,
    top: "1rem",
    left: "1rem",
    display: "grid",
    flexDirection: "row",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
  },
]);
