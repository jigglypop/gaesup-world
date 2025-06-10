import { scDream } from "@styles/fonts.css";
import { flex, grid } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const outer = style({
  position: "fixed",
  left: "1rem",
  bottom: "1rem",
  width: "35rem",
  height: "25rem",
  margin: "1rem 0",
  borderRadius: "1rem",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  boxShadow: "0 0 1rem rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(1rem)",
  overflowY: "scroll",
  zIndex: "100",
});

export const innerTitles = style([
  grid({ column: "center" }),
  {
    gridTemplateColumns: "repeat(4, 1fr)",
    width: "100%",
    padding: "1rem",
    borderRadius: "0.5rem",
  },
]);

export const innerTitleItem = style([
  {
    gridAutoColumns: "1fr",
    fontSize: "1.8rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: 600,
  },
]);

export const tap = style([
  {
    position: "relative",
    width: "4rem",
    height: "2.5rem",
    display: "inline-block",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: "0.5rem 0.5rem 0.5rem 0",
    transition: "all 0.3s ease",
    padding: "0.3rem",
    borderRadius: "0.5rem",
    fontSize: "1.2rem",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    fontFamily: scDream,
    fontWeight: 600,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
  },
]);

export const subTitle = style([
  {
    fontSize: "1.2rem",
    margin: "0.5rem",

    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: 400,
  },
]);

export const meshList = style([
  {
    display: "flex",
    width: "100%",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    flexDirection: "row",
    overflowX: "scroll",
    gap: "0.5rem",
  },
]);

export const mesh = style([
  {
    minWidth: "6rem",
    fontSize: "1rem",
    fontFamily: scDream,
    fontWeight: 400,
    cursor: "pointer",
  },
]);

export const meshOuter = style([
  flex({ column: "10" }),
  {
    padding: "1rem",
    width: "100%",
    borderRadius: "0.5rem",
    margin: "1rem 0",
  },
]);

export const meshInfo = style([
  flex({ column: "10" }),
  {
    width: "100%",
    borderRadius: "1rem",
    margin: "1rem 0 1rem 0",
    padding: "1rem",
  },
]);

export const meshGrid = style([
  grid({ column: "center" }),
  {
    width: "100%",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
]);

export const colorPicker = style([
  flex({ column: "12" }),
  {
    width: "100%",
    height: "100%",
    gridColumn: "1/2",
    gridTemplateRows: "3rem repeat(2, 1fr)",
  },
]);

export const materialType = style([
  grid({ column: "12" }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
  },
]);

export const materialTitle = style([
  subTitle,
  {
    gridColumn: "1/3",
  },
]);
