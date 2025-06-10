import { palette } from "@styles/constants/palette.css";
import { recipe } from "@vanilla-extract/recipes";

export const textAreaRecipe = recipe({
  base: {
    position: "relative",
    padding: "0.5rem",
    margin: "0.2rem",
    verticalAlign: "middle",
    fontSize: "1.2rem",
    color: "white",
    border: "none",
    selectors: {
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.6)",
      },
    },
    width: "100%",
    "::-webkit-input-placeholder": {
      color: palette.gray200,
    },
  },
  variants: {
    glass: {
      true: {
        backdropFilter: "blur(2rem)",
        WebkitBackdropFilter: "blur(2rem)",
        borderRadius: "1rem",
      },
    },
    white: {
      true: {
        borderRadius: "1rem",
        background: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
      },
    },
    black: {
      true: {
        borderRadius: "1rem",
        background: "rgba(0, 0, 0, 0.2)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      },
    },
    blackSmall: {
      true: {
        borderRadius: "1rem",
        width: "6rem",
        height: "3rem",
        background: "rgba(0, 0, 0, 0.2)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      },
    },
    transparent: {
      true: {
        background: "transparent",
      },
    },
  },
});
