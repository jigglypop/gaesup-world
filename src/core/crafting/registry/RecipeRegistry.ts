import { DefinitionRegistry } from '../../utils/definitionRegistry';
import type { RecipeDef, RecipeId } from '../types';

export type RecipeRegistry = DefinitionRegistry<RecipeId, RecipeDef>;

let _instance: RecipeRegistry | null = null;
export function getRecipeRegistry(): RecipeRegistry {
  if (!_instance) _instance = new DefinitionRegistry('RecipeId');
  return _instance;
}
