import { blackHanSans, nanumSquareB } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const modalInner = style([
  flex({
    column: "9",
  }),
  {
    position: "relative",
    minWidth: "30rem",
    overflowX: "hidden",
    borderRadius: "10px",
    padding: "0.5rem",
    margin: "1rem",
    width: "95%",
    height: "95%",
    wordBreak: "break-all",
    overflowY: "scroll",
  },
]);

export const modalImg = style([
  {
    borderRadius: "10px",
    margin: "1rem",
    opacity: 0.4,
    boxShadow: "0 0 20px rgba(0, 0, 0, 1)",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    selectors: {
      "&:hover": {
        opacity: 0.8,
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
  fontSize: "5.5rem",
  fontFamily: blackHanSans,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "5rem",
    },
    "(max-width: 600px)": {
      fontSize: "4rem",
    },
    "(max-width: 372px)": {
      fontSize: "3.5rem",
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
  fontSize: "3rem",
  fontFamily: blackHanSans,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2.5rem",
    },
    "(max-width: 600px)": {
      fontSize: "2rem",
    },
    "(max-width: 372px)": {
      fontSize: "1.8rem",
    },
  },
});

globalStyle(`${modalInner} h2 `, {
  margin: "0",
  padding: "0",
  lineHeight: "1.5",
  fontSize: "1.3rem",
  wordBreak: "break-all",
  color: "rgba(0, 0, 0, 0.6)",
  fontFamily: nanumSquareB,
});
