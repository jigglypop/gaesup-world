import { CSSProperties, MouseEventHandler } from "react";

import { buttonRecipe } from "@styles/recipe/button.css";
import { RecipeVariants } from "@vanilla-extract/recipes";

// 버튼 타입
export type buttonType = {
  children: React.ReactNode;
  styles?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
  recipe?: buttonRecipeType;
};

export type barType = {
  // child
  children: React.ReactNode;
  styles?: CSSProperties;
};

export type buttonRecipeType = RecipeVariants<typeof buttonRecipe>;
