import type { ItemId } from '../items/types';

export type RecipeId = string;

export type RecipeIngredient = { itemId: ItemId; count: number };

export type RecipeDef = {
  id: RecipeId;
  name: string;
  ingredients: RecipeIngredient[];
  output: { itemId: ItemId; count: number };
  requireBells?: number;
  unlockedByDefault?: boolean;
};

export type CraftingSerialized = {
  version: number;
  unlocked: string[];
};
