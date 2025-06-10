import { palette } from "@styles/constants/palette.css";
import { RecipeVariants, recipe } from "@vanilla-extract/recipes";
import { cancelStyle } from "./styles.css";

export const cancelRecipe = recipe({
  base: cancelStyle,
  variants: {
    color: {
      gray: {
        background: palette.gray400,
        color: "rgba(0, 0, 0, 0.9)",
        boxShadow: `0 0 10px ${palette.gray600}`,
      },
    },
    positions: {
      tap: {
        position: "absolute",
        top: "-1rem",
        right: "-1rem",
        width: "2rem",
        height: "2rem",
        boxShadow: "0 0 1rem rgba(0,0,0,0.5)",
        border: "0.1rem solid rgba(0,0,0,0.5)",
        backgroundColor: "rgba(0,0,0,0.5)",
        color: "rgba(255,255,255,0.8)",
      },
    },
  },
});

export type cancelRecipeType = RecipeVariants<typeof cancelRecipe>;
