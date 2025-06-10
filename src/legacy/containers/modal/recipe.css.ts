import { recipe } from "@vanilla-extract/recipes";
import { modalOuter } from "./styles.css";

export const modalRecipe = recipe({
  base: modalOuter,
  variants: {
    isOpen: {
      true: {
        transform: "translateX(0)",
      },
      false: {
        transform: "translateX(85rem)",
      },
    },
    full: {
      true: {
        position: "fixed",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        overflow: "hidden",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px)",
      },
      false: {
        borderRadius: "1rem",
      },
    },
    half: {
      true: {
        background: "transparent",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
        padding: 0,
        overflow: "hidden",
      },
    },
  },
});

export const modalOuterRecipe = recipe({
  base: {
    position: "fixed",
    width: "100vw",
    height: "100vh",
    top: 0,
    left: 0,
    overflow: "hidden",
    zIndex: 999,
    background: "transparent",
  },
  variants: {
    isOpen: {
      true: {
        transform: "translateX(0)",
      },
      false: {
        transform: "translateX(100vw)",
      },
    },
  },
});
