import { create } from 'zustand';

import { useWalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { notify } from '../../ui/components/Toast/toastStore';
import { getRecipeRegistry } from '../registry/RecipeRegistry';
import type { CraftingSerialized, RecipeId } from '../types';

type State = {
  unlocked: Set<RecipeId>;

  unlock: (id: RecipeId) => void;
  isUnlocked: (id: RecipeId) => boolean;

  canCraft: (id: RecipeId) => { ok: boolean; reason?: string };
  craft: (id: RecipeId) => { ok: boolean; reason?: string };

  serialize: () => CraftingSerialized;
  hydrate: (data: CraftingSerialized | null | undefined) => void;
};

export const useCraftingStore = create<State>((set, get) => ({
  unlocked: new Set<RecipeId>(),

  unlock: (id) => {
    const def = getRecipeRegistry().get(id);
    if (!def) return;
    if (get().unlocked.has(id)) return;
    const next = new Set(get().unlocked);
    next.add(id);
    set({ unlocked: next });
    notify('info', `레시피 해금: ${def.name}`);
  },

  isUnlocked: (id) => {
    const def = getRecipeRegistry().get(id);
    if (!def) return false;
    if (def.unlockedByDefault) return true;
    return get().unlocked.has(id);
  },

  canCraft: (id) => {
    const def = getRecipeRegistry().get(id);
    if (!def) return { ok: false, reason: 'unknown recipe' };
    if (!get().isUnlocked(id)) return { ok: false, reason: 'locked' };
    const inv = useInventoryStore.getState();
    for (const ing of def.ingredients) {
      if (inv.countOf(ing.itemId) < ing.count) return { ok: false, reason: 'missing ingredients' };
    }
    if (def.requireBells && useWalletStore.getState().bells < def.requireBells) {
      return { ok: false, reason: 'insufficient bells' };
    }
    return { ok: true };
  },

  craft: (id) => {
    const check = get().canCraft(id);
    if (!check.ok) return check;
    const def = getRecipeRegistry().require(id);
    const inv = useInventoryStore.getState();
    for (const ing of def.ingredients) {
      const removed = inv.removeById(ing.itemId, ing.count);
      if (removed < ing.count) return { ok: false, reason: 'remove failed' };
    }
    if (def.requireBells) {
      if (!useWalletStore.getState().spend(def.requireBells)) return { ok: false, reason: 'spend failed' };
    }
    const left = inv.add(def.output.itemId, def.output.count);
    if (left > 0) {
      notify('warn', '인벤토리 부족, 일부 결과물 폐기');
    } else {
      notify('reward', `제작 완료: ${def.name}`);
    }
    return { ok: true };
  },

  serialize: () => ({ version: 1, unlocked: Array.from(get().unlocked) }),

  hydrate: (data) => {
    if (!data || !Array.isArray(data.unlocked)) return;
    set({ unlocked: new Set(data.unlocked) });
  },
}));
