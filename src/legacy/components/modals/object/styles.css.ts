import { blackHanSans, nanumSquareB } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

export const fadeIn = keyframes({
  from: {
    transform: "translate(0, 3rem)",
    opacity: 0,
  },
  to: {
    transform: "translate(50%, 0)",
    opacity: 0.8,
  },
});

export const modalOuter = style([
  flex({
    column: "center",
  }),
  {
    position: "relative",
    width: "100%",
    height: "100%",
  },
]);

export const modalInner = style([
  flex({
    column: "center",
  }),
  {
    position: "relative",
    borderRadius: "10px",
    width: "90%",
    height: "60%",
    minWidth: "30rem",
    maxWidth: "40rem",
    minHeight: "30rem",
    boxShadow: "0 0 1rem #a1ffce",
    wordBreak: "break-all",
    overflow: "hidden",
    margin: 0,
    padding: 0,
    background: vars.gradient.mint,
  },
]);

export const modalTitle = style([
  {
    position: "absolute",
    top: "1rem",
    right: "50%",
    transform: "translate(50%, 0)",
    zIndex: 10,
    fontSize: "6rem",
    color: "rgba(0, 0, 0, 0.7)",
    textShadow: "0 0 1rem rgba(50, 50, 50, 0.8)",
    fontFamily: blackHanSans,
    transition: "all 0.3s ease-in-out",
    animation: `${fadeIn} 1s ease-in-out`,
  },
]);

export const modalButtons = style([
  {
    position: "absolute",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0",
    bottom: "1rem",
    right: "50%",
    transform: "translateX(50%)",
    zIndex: 10,
  },
]);

export const modalImg = style([
  {
    borderRadius: "10px",
    margin: "1rem",
    opacity: 0.9,
    boxShadow: "0 0 1rem rgba(0, 0, 0, 1)",
    transition: "all 0.3s ease-in-out",
    maxWidth: "25rem",
    cursor: "pointer",
    objectFit: "cover",
    selectors: {
      "&:hover": {
        boxShadow: "0 0 3rem rgba(0, 0, 0, 1)",
      },
    },
  },
]);

globalStyle(`${modalInner} h1 `, {
  margin: "0",
  padding: "0",
  lineHeight: "1.2",
  color: "rgba(0, 0, 0, 0.7)",
  // 글자 테두리
  WebkitTextStroke: "0.1px rgba(0, 0, 0, 0.9)",
  textShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  fontSize: "4rem",
  fontFamily: blackHanSans,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "3.5rem",
    },
    "(max-width: 600px)": {
      fontSize: "3rem",
    },
  },
});

globalStyle(`${modalInner} h3 `, {
  margin: "0",
  padding: "0",
  lineHeight: "1.2",
  color: "rgba(0, 0, 0, 0.5)",
  // 글자 테두리
  WebkitTextStroke: "0.1px rgba(0, 0, 0, 0.6)",
  textShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  fontSize: "2.5rem",
  wordBreak: "break-all",
  fontFamily: blackHanSans,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2rem",
    },
    "(max-width: 600px)": {
      fontSize: "1.8rem",
    },
    "(max-width: 372px)": {
      fontSize: "1.6rem",
    },
  },
});

globalStyle(`${modalInner} p `, {
  position: "relative",
  width: "100%",
  margin: 0,
  padding: 0,
  lineHeight: "1.5",
  fontSize: "1.3rem",
  wordBreak: "break-all",
  color: "rgba(0, 0, 0, 0.6)",
  fontFamily: nanumSquareB,
});
