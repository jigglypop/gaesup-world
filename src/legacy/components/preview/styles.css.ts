import { scDream } from "@styles/fonts.css";
import { buttonRecipe } from "@styles/recipe/button.css";
import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const diOuter = style([
  flex({
    column: "center",
  }),
  {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    borderRadius: "0.5rem",
    padding: "1rem",
    backdropFilter: "blur(0.5rem)",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

export const blockOuter = style([
  flex({
    row: "center",
  }),
  {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
    borderRadius: "0.5rem",
    margin: "1rem",
    padding: "1rem",
    backdropFilter: "blur(0.5rem)",
    width: "20rem",
    height: "4rem",
    fontSize: "1.5rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

export const direction = style([
  {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
  },
]);

export const button = style([
  buttonRecipe({ color: "purple" }),
  {
    width: "5rem",
    height: "5rem",
    margin: "0.5rem",
    fontSize: "1.4rem",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

export const numButton = style([
  buttonRecipe({ color: "gray" }),
  {
    width: "5rem",
    height: "5rem",
    margin: "0.5rem",
    fontSize: "1.4rem",
    fontFamily: scDream,
    fontWeight: 800,
  },
]);

// 업데이트 룸 띄우기
export const deleteObject = style([
  flex({ column: "center" }),
  {
    position: "absolute",
    right: "-4.5rem",
    top: "-1rem",
    width: "3rem",
    borderRadius: "0.5rem",
    height: "3rem",
    background: vars.gradient.black,
    boxShadow: `0 0 10px rgba(0, 0, 0, 1)`,
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease-in",
    cursor: "pointer",
    zIndex: 1,
  },
]);
// 업데이트 룸 띄우기
export const updateObject = style([
  flex({ column: "center" }),
  {
    position: "absolute",
    right: "-1.5rem",
    top: "-1rem",
    width: "6rem",
    borderRadius: "0.5rem",
    height: "6rem",
    background: vars.gradient.purple,
    boxShadow: `0 0 10px #8e2de2`,
    fontSize: "3rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    zIndex: 1,
  },
]);

// 룸 취소 버튼
export const cancel = style([
  flex({ column: "center" }),
  {
    position: "absolute",
    right: "-8.5rem",
    top: "-1rem",
    width: "6rem",
    borderRadius: "0.5rem",
    height: "6rem",
    background: vars.gradient.black,
    boxShadow: `0 0 10px black`,
    fontSize: "3rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    zIndex: 1,
  },
]);
// 업데이트 룸 띄우기
export const normalInfo = style([
  flex({
    column: "center",
  }),
  {
    position: "absolute",
    top: "-1rem",
    left: "-16rem",
    borderRadius: "1rem",
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    backdropFilter: "blur(0.5rem)",
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease-in",
    cursor: "pointer",
    fontFamily: scDream,
    fontWeight: 800,
    zIndex: 10,
  },
]);

globalStyle(`${normalInfo} p`, {
  margin: "0",
  padding: "1rem",
  lineHeight: "1.2",
});
