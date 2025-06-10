import { blackHanSans, scDream } from "@styles/fonts.css";
import { flex, glass } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const objectUpdate = style([
  flex({ row: "center" }),
  {
    position: "relative",
    width: "4rem",
    borderRadius: "0.5rem",
    height: "4rem",
    background: vars.gradient.purple,
    boxShadow: `0 0 10px #8e2de2`,
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    zIndex: 1,
  },
]);
// 룸 취소 버튼
export const cancel = style([
  flex({ row: "center" }),
  {
    position: "relative",
    width: "4rem",
    borderRadius: "0.5rem",
    height: "4rem",
    background: vars.gradient.black,
    boxShadow: `0 0 10px black`,
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    zIndex: 1,
  },
]);
// 업데이트 룸 띄우기
export const normalInfo = style([
  flex({
    row: "center",
  }),
  {
    position: "relative",
    top: "-1rem",
    borderRadius: "1rem",
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    backdropFilter: "blur(0.5rem)",
    fontSize: "1.5rem",
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

export const speechBalloonOuter = style([
  glass({}),
  flex({
    column: "center",
  }),
  {
    position: "absolute",
    borderRadius: "3rem",
    minWidth: "12rem",
    padding: "0.5rem",
    background: vars.gradient.green,
    boxShadow: `0 0 10px rgba(99,251,215,1)`,
  },
]);

// 메시지 말풍선
export const message = style([
  flex({
    row: "center",
  }),
  {
    width: "18rem",
    borderRadius: "2rem",
    height: "6rem",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "0.5rem solid rgba(0, 0, 0, 0.5)",
    fontSize: "2.5rem",
    color: "rgba(0, 0, 0, 0.7)",
    transition: "all 0.3s ease-in",
    cursor: "pointer",
    fontFamily: blackHanSans,
    selectors: {
      "&:hover": {
        backgroundColor: "rgba(99,251,215,1)",
      },
    },
  },
]);

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
