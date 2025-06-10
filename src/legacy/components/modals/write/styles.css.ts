import { palette } from "@styles/constants/palette.css";
import { scDream } from "@styles/fonts.css";
import { buttonRecipe } from "@styles/recipe/button.css";

import { flex } from "@styles/recipe/index.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const deleteStyle = style([
  flex({
    direction: "column",
  }),
  {
    width: "45rem",
    height: "90%",
    position: "relative",
    borderRadius: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    minWidth: "30rem",
    overflowX: "hidden",
    padding: "2rem",
    "@media": {
      "(max-width: 768px)": {
        width: "40rem",
        height: "50rem",
      },
      "(max-width: 375px)": {
        width: "32rem",
      },
    },
  },
]);

export const cancelStyle = style([
  flex({
    direction: "column",
  }),
  {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    width: "3rem",
    height: "3rem",
    fontSize: "4rem",
    color: "black",
    borderRadius: "50%",
    cursor: "pointer",
    backgroundColor: palette.gray800,
    boxShadow: "0 0 10px rgba(0, 0, 0)",
  },
]);

export const upperDeleteText = style([
  {
    margin: "0",
    fontSize: "1.5rem",
  },
]);

export const under = style([
  flex({
    direction: "row",
  }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
  },
]);

// 기본
export const defaultButton = style([
  {
    width: "8rem",
    height: "3rem",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
  },
]);
// 업데이트 버튼
export const updateButton = style([
  defaultButton,
  buttonRecipe({
    color: "mint",
  }),
]);
// 삭제 버튼
export const deleteButton = style([
  defaultButton,
  buttonRecipe({
    color: "pink",
  }),
]);
export const forms = style({
  position: "absolute",
  width: "60rem",
  height: "80rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  zIndex: 10,
  transform: "all 0.5s ease-in-out",
});

export const text = style({
  fontSize: "5rem",
  lineHeight: "2",
  margin: "0.5rem",
  padding: "0.5rem",
  fontFamily: scDream,
  fontWeight: 800,
});

export const discription = style({
  textAlign: "left",
  margin: "0.5rem",
  fontSize: "1.3rem",
  color: "rgba(255, 255, 255, 0.8)",
});

export const form = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
});

export const toggle = style({
  marginTop: "2rem",
  color: "#b8a8ff",
  fontSize: "1.2rem",
  fontWeight: "800",
});

export const fieldOuter = style([
  {
    position: "relative",
    width: "100%",
  },
]);

export const field = style([
  inputRecipe({
    black: true,
  }),
  {
    position: "relative",
    padding: "1rem",
    margin: "0.2rem",
    verticalAlign: "middle",
    fontSize: "1.5rem",
    color: "white",
    selectors: {
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.6)",
      },
    },
  },
]);

export const textAreaField = style([
  inputRecipe({
    black: true,
  }),
  {
    position: "relative",
    padding: "1rem",
    margin: "0.2rem",
    verticalAlign: "middle",
    border: "none",
    outline: "none",
    fontSize: "1.5rem",
    height: "20rem",
    color: "white",
    selectors: {
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.6)",
      },
    },
  },
]);

export const errorDiv = style({
  height: "2rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "1.2rem",
});

export const toggleAuth = style({
  fontSize: "1.4rem",
  margin: "1rem",
  transition: "all 0.3s ease-in",
});

globalStyle(`${toggleAuth} span`, {
  color: palette.gray800,
  fontWeight: "400",
  cursor: "pointer",
});

export const errorMsg = style({
  fontSize: "1.4rem",
  color: palette.gray400,
});
