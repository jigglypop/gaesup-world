import { scDream } from "@styles/fonts.css";
import { flex } from "@styles/recipe/index.css";
import { keyframes, style } from "@vanilla-extract/css";

export const fadeIn = keyframes({
  from: {
    transform: "translateY(-3rem)",
    opacity: 0,
  },
  to: {
    transform: "translateY(0)",
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
    width: "80%",
    height: "30%",
    minWidth: "20rem",
    maxWidth: "30rem",
    minHeight: "20rem",
    boxShadow: "0 0 1rem black",
    wordBreak: "break-all",
    overflow: "hidden",
    margin: 0,
    padding: 0,
    background: "rgba(50, 50, 50, 0.5)",
    backdropFilter: "blur(1rem)",
  },
]);

export const modalTitle = style([
  flex({ column: "center" }),
  {
    position: "relative",
    zIndex: 10,
    fontSize: "3rem",
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "0 0 1rem rgba(50, 50, 50, 0.8)",
    fontFamily: scDream,
    fontWeight: 800,
    transition: "all 0.1s ease-in-out",
    animation: `${fadeIn} 0.3s ease-in-out`,
  },
]);

export const modalSubtitle = style([
  flex({ column: "center" }),
  {
    position: "relative",
    zIndex: 10,
    fontSize: "1.5rem",
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "0 0 1rem rgba(50, 50, 50, 0.8)",
    fontFamily: scDream,
    fontWeight: 800,
    transition: "all 0.1s ease-in-out",
    animation: `${fadeIn} 1s ease-in-out`,
  },
]);

export const modalButtons = style([flex({})]);
