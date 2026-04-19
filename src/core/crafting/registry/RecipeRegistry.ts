import type { RecipeDef, RecipeId } from '../types';

class RecipeRegistry {
  private defs = new Map<RecipeId, RecipeDef>();

  register(def: RecipeDef): void {
    if (this.defs.has(def.id)) return;
    this.defs.set(def.id, def);
  }

  registerAll(defs: RecipeDef[]): void {
    for (const d of defs) this.register(d);
  }

  get(id: RecipeId): RecipeDef | undefined { return this.defs.get(id); }

  require(id: RecipeId): RecipeDef {
    const v = this.defs.get(id);
    if (!v) throw new Error(`Unknown RecipeId: ${id}`);
    return v;
  }

  all(): RecipeDef[] { return Array.from(this.defs.values()); }
  has(id: RecipeId): boolean { return this.defs.has(id); }
  clear(): void { this.defs.clear(); }
}

let _instance: RecipeRegistry | null = null;
export function getRecipeRegistry(): RecipeRegistry {
  if (!_instance) _instance = new RecipeRegistry();
  return _instance;
}
export type { RecipeRegistry };
