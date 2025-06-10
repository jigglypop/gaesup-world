import { blackHanSans, scDream } from "@styles/fonts.css";
import { pulseOpacity } from "@styles/keyframes/keyframes.css";
import { flex, glass } from "@styles/recipe/index.css";
import { vars } from "@styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const leftButton = style([
  {
    width: "18rem",
    height: "12rem",
    borderRadius: "2rem",
    fontSize: "2.5rem",
    cursor: "pointer",
    fontFamily: scDream,
    fontWeight: "800",
  },
]);

export const button = style([
  glass({}),
  flex({}),
  {
    width: "13rem",
    margin: "1rem",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    background: vars.gradient.gray,
    boxShadow: "0 0 10px #1d1d1d",
    transition: "all 0.3s ease-in",
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    fontFamily: scDream,
    fontWeight: "800",
    selectors: {
      "&:hover": {
        boxShadow: "0 0 20px #1d1d1d",
      },
    },
    "@media": {
      "(max-width: 1024px)": {
        width: "12rem",
        fontSize: "1.4rem",
      },
    },
  },
]);

export const arrow = style([
  {
    fontSize: "2rem",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0 0.5rem 0.5rem 0.5rem",
    transition: "all 0.1s ease-in",
  },
]);

export const buttonText = style([
  flex({
    row: "9",
  }),
  {
    color: "rgba(255,255,255,0.8)",
    textShadow: "0 0 10px rgba(255,255,255,0.8)",
    fontSize: "2rem",
    margin: "1rem 0.5rem 0 1rem",
    padding: "0",
    gridColumn: "1 / -1",
    fontFamily: blackHanSans,
  },
]);

export const header = style([
  {
    display: "flex",
    justifyContent: "start",
    alignItems: "start",
    position: "fixed",
    top: "5rem",
    left: "0.5rem",
    zIndex: 1000,
  },
]);

export const headerOuter = style([
  {
    zIndex: 1001,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    margin: 0,
    height: "6rem",
    padding: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    textShadow: "0 0 5px rgba(255, 255, 255, 0.8)",
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
    fontFamily: blackHanSans,
  },
]);

export const headerInner = style([
  {
    display: "grid",
    position: "fixed",
    top: "7rem",
    left: "1rem",
    width: "30rem",
    height: "26rem",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "0.5rem",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
    fontFamily: blackHanSans,
    transition: "all 0.3s ease-in",
    "@media": {
      "(max-width: 600px)": {
        display: "grid",
        width: "24rem",
      },
    },
  },
]);
export const logo = style([
  {
    top: "1rem",
    left: "1rem",
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: blackHanSans,
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
    transition: "all 1s ease-in-out",
    cursor: "pointer",
    zIndex: 1000,
  },
]);

export const logoRight = style([
  {
    top: "1rem",
    right: "1rem",
    position: "fixed",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    textAlign: "center",
    fontFamily: blackHanSans,
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.7)",
    transition: "all 1s ease-in-out",
    zIndex: 500,
  },
]);

export const upperLogo = style([
  {
    top: "2vh",
    fontSize: "2rem",
    fontFamily: blackHanSans,
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255, 255, 255, 0.8)",
    transition: "all 1s ease-in-out",
    zIndex: 1000,
    animation: `${pulseOpacity} 1s infinite`,
    "@media": {
      "(max-width: 1440px)": {
        fontSize: "2rem",
      },
      "(max-width: 1024px)": {
        fontSize: "1.5rem",
      },
      "(max-width: 768px)": {
        fontSize: "1.3rem",
      },
      "(max-width: 371px)": {
        fontSize: "1rem",
      },
    },
  },
]);

export const underLogo = style([
  {
    top: "90vh",
    fontSize: "2rem",
    fontFamily: blackHanSans,
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255, 255, 255, 0.8)",
    textShadow: "0 0 5px rgba(255, 255, 255, 0.8)",
    transition: "all 1s ease-in-out",
    zIndex: 1000,
    "@media": {
      "(max-width: 1440px)": {
        fontSize: "2rem",
      },
      "(max-width: 1024px)": {
        fontSize: "1.5rem",
      },
      "(max-width: 768px)": {
        fontSize: "1.2rem",
      },
    },
  },
]);

globalStyle(`${underLogo} span`, {
  fontSize: "2.5rem",
  fontFamily: blackHanSans,
  color: "rgba(5, 5, 5, 0.4)",
  textShadow: "0 0 5px rgba(5, 5, 5, 4)",
});
