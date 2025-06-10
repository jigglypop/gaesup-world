import { recipe } from "@vanilla-extract/recipes";

export const avatarRecipe = recipe({
  base: {
    width: "3rem",
    height: "3rem",
  },
  variants: {
    type: {
      small: {
        width: "2rem",
        height: "2rem",
      },
    },
  },
});
