import { palette } from "@styles/constants/palette.css";
import { blackHanSans, scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { globalStyle, style } from "@vanilla-extract/css";

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

export const cancelStyle = style([
  flex({}),
  {
    position: "absolute",
    top: "2rem",
    right: "1rem",
    fontSize: "3rem",
    background: palette.gray400,
    color: "rgba(0, 0, 0, 0.9)",
    boxShadow: `0 0 10px ${palette.gray600}`,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.3s ease-in-out",
    selectors: {
      "&:hover": {
        color: "rgba(0, 0, 0, 0.2)",
      },
    },
  },
]);
export const modalInner = style([
  flex({
    column: "center",
  }),
  {
    position: "relative",
    borderRadius: "10px",
    width: "80%",
    height: "30%",
    minWidth: "40rem",
    maxWidth: "60rem",
    minHeight: "60rem",
    boxShadow: "0 0 1rem black",
    wordBreak: "break-all",
    overflow: "hidden",
    margin: 0,
    padding: 0,
    color: "rgba(255, 255, 255, 0.7)",
    background: "rgba(50, 50, 50, 0.5)",
    backdropFilter: "blur(1rem)",
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
  lineHeight: "1.4",
  color: "rgba(255, 255, 255, 0.8)",
  // 글자 테두리
  WebkitTextStroke: "0.1px rgba(0, 0, 0, 0.9)",
  textShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  fontSize: "8rem",
  fontFamily: scDream,
  fontWeight: 800,
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
  lineHeight: "1.4",
  color: "rgba(255, 255, 255, 0.8)",
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
  lineHeight: "1.4",
  fontSize: "1.4rem",
  wordBreak: "break-all",
  color: "rgba(255, 255, 255, 0.8)",
  fontFamily: scDream,
});
