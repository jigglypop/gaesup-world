import { RecipeVariants } from "@vanilla-extract/recipes";
import { toastRecipe } from "./styles.css";

export type toastType = "npc" | "warning" | "error" | "success";
export type toastRecipeType = RecipeVariants<typeof toastRecipe>;
