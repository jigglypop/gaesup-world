import { RecipeVariants } from "@vanilla-extract/recipes";
import { CSSProperties } from "react";
import { avatarRecipe } from "./recipe.css";

export type avatarType = {
  imageUrl: string;
  styles?: { [K in keyof CSSProperties]: string };
  roleNumber?: 0 | 1 | 2;
} & avatarVarientType;

export type avatarVarientType = RecipeVariants<typeof avatarRecipe>;
