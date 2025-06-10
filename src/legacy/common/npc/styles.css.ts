import { scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

// 업데이트 룸 띄우기
export const update = style([
  flex({
    row: "center",
  }),
  {
    width: "100%",
    borderRadius: "1rem",
    padding: "1rem",
    height: "3.5rem",
    backgroundColor: "rgba(50, 50, 50, 0.8)",
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease-in",
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
    width: "3rem",
    borderRadius: "0.5rem",
    height: "3rem",
    background: vars.gradient.mint,
    boxShadow: `0 0 10px rgba(99,251,215,1)`,
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease-in",
    cursor: "pointer",
    zIndex: 1,
  },
]);
export const objectUpdate = style([
  flex({ row: "center" }),
  {
    position: "absolute",
    top: "-1rem",
    left: "2rem",
    width: "2rem",
    borderRadius: "0.5rem",
    height: "2rem",
    background: vars.gradient.purple,
    boxShadow: `0 0 10px #8e2de2`,
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    zIndex: 1,
  },
]);
// 룸 취소 버튼
export const cancel = style([
  flex({ row: "center" }),
  {
    position: "absolute",
    top: "-1rem",
    left: "0",
    width: "2rem",
    borderRadius: "0.5rem",
    height: "2rem",
    background: vars.gradient.black,
    boxShadow: `0 0 10px black`,
    fontSize: "1rem",
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
    position: "relative",
    minWidth: "8rem",
    width: "100%",
    borderRadius: "1rem",
    backgroundColor: "rgba(10, 10, 10, 0.5)",
    backdropFilter: "blur(0.5rem)",
    fontSize: "1rem",
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
