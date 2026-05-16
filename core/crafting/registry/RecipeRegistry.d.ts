import type { RecipeDef, RecipeId } from '../types';
declare class RecipeRegistry {
    private defs;
    register(def: RecipeDef): void;
    registerAll(defs: RecipeDef[]): void;
    get(id: RecipeId): RecipeDef | undefined;
    require(id: RecipeId): RecipeDef;
    all(): RecipeDef[];
    has(id: RecipeId): boolean;
    clear(): void;
}
export declare function getRecipeRegistry(): RecipeRegistry;
export type { RecipeRegistry };
