import { scDream } from "@styles/fonts.css";
import { flex, grid } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const cancelStyle = {
  position: "absolute",
  top: "-1rem",
  right: "-1rem",
  width: "2rem",
  height: "2rem",
  boxShadow: "0 0 1rem rgba(0,0,0,0.5)",
  border: "0.1rem solid rgba(0,0,0,0.5)",
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "rgba(255,255,255,0.8)",
};

export const outer = style([
  {
    position: "fixed",
    left: "1rem",
    top: "5rem",
    maxWidth: "35rem",
    margin: "1rem 0",
    borderRadius: "1rem",
    backgroundColor: "rgba(50, 50, 50, 0.2)",
    boxShadow: "0 0 1rem rgba(100, 100, 100, 0.2)",
    backdropFilter: "blur(1rem)",
    overflowY: "scroll",
    zIndex: 100,
  },
]);
export const inner = style([
  flex({ column: "10" }),
  {
    position: "relative",
    padding: "0.5rem",
    width: "100%",
    height: "100%",
    minWidth: "30rem",
    background: "rgba(50, 50, 50, 0.8)",
    boxShadow: "0 0 1rem rgba(50, 50, 50, 0.8)",
    zIndex: 100,
  },
]);

globalStyle(`${inner} p `, {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "1.2rem",
  fontFamily: scDream,
  fontWeight: 600,
});

export const innerTitles = style([
  grid({ column: "center" }),
  {
    gridTemplateColumns: "repeat(4, 1fr)",
    width: "100%",
    padding: "1rem",
  },
]);

export const innerTitleItem = style([
  {
    gridColumn: "1/3",
    textAlign: "start",
    fontSize: "1.4rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

export const parentList = style([
  {
    display: "grid",
    width: "100%",
    height: "10rem",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: "0.5rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
    padding: "2rem",
    flexDirection: "row",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(5, 1fr)",
    overflowY: "scroll",
    overflowX: "hidden",
  },
]);

export const parent = style([
  {
    position: "relative",
    padding: "0.5rem",
    margin: "0.5rem",
    borderRadius: "0.5rem",
    minWidth: "7rem",
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    fontFamily: scDream,
    fontWeight: 300,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
  },
]);

export const subTitle = style([
  {
    fontSize: "1.2rem",
    margin: "1rem",

    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: 400,
  },
]);

export const meshList = style([
  {
    display: "flex",
    width: "100%",
    minHeight: "6.5rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "0.5rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
    padding: "1.5rem",
    flexDirection: "row",
    overflowX: "scroll",
    gap: "0.5rem",
  },
]);

export const npcList = style([
  {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "5.5rem",
    backgroundColor: "rgba(10, 10, 10, 0.2)",
    boxShadow: "0 0 1rem rgba(10, 10, 10, 0.2)",
    borderRadius: "0.5rem",
    padding: "1rem",
    flexDirection: "row",
    overflowX: "scroll",
    gap: "0.3rem",
  },
]);

export const mesh = style([
  {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    minWidth: "6rem",
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    fontFamily: scDream,
    fontWeight: 400,
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
  },
]);

export const meshOuter = style([
  flex({ column: "10" }),
  {
    padding: "1rem",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
    margin: "1rem 0",
  },
]);

export const meshInfo = style([
  flex({ column: "10" }),
  {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: "1rem",
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
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
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "3rem repeat(2, 1fr)",
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
