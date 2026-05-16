import type { CraftingSerialized, RecipeId } from '../types';
type State = {
    unlocked: Set<RecipeId>;
    unlock: (id: RecipeId) => void;
    isUnlocked: (id: RecipeId) => boolean;
    canCraft: (id: RecipeId) => {
        ok: boolean;
        reason?: string;
    };
    craft: (id: RecipeId) => {
        ok: boolean;
        reason?: string;
    };
    serialize: () => CraftingSerialized;
    hydrate: (data: CraftingSerialized | null | undefined) => void;
};
export declare const useCraftingStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
