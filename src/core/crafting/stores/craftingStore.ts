import { create } from 'zustand';


import { useWalletStore, type WalletStore } from '../../economy/stores/walletStore';
import { useInventoryStore, type InventoryStore } from '../../inventory/stores/inventoryStore';
import { runtimeStoreServiceKey } from '../../plugins/serviceKey';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';
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
  prepareHydrate: (data: CraftingSerialized | null | undefined) => () => void;
};

export function createCraftingStore(inventoryStore: InventoryStore, walletStore: WalletStore) {
  return create<State>((set, get) => ({
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
    const inv = inventoryStore.getState();
    const required = new Map<string, number>();
    for (const ing of def.ingredients) {
      required.set(ing.itemId, (required.get(ing.itemId) ?? 0) + ing.count);
    }
    for (const [itemId, count] of required) {
      if (inv.countOf(itemId) < count) return { ok: false, reason: 'missing ingredients' };
    }
    if (def.requireBells && walletStore.getState().bells < def.requireBells) {
      return { ok: false, reason: 'insufficient bells' };
    }
    if (!inv.canAdd([def.output], def.ingredients)) return { ok: false, reason: 'inventory full' };
    return { ok: true };
  },

  craft: (id) => {
    const check = get().canCraft(id);
    if (!check.ok) return check;
    const def = getRecipeRegistry().require(id);
    const inv = inventoryStore.getState();
    for (const ing of def.ingredients) {
      const removed = inv.removeById(ing.itemId, ing.count);
      if (removed < ing.count) return { ok: false, reason: 'remove failed' };
    }
    if (def.requireBells) {
      if (!walletStore.getState().spend(def.requireBells)) return { ok: false, reason: 'spend failed' };
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

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.unlocked)) {
      throw new TypeError('Invalid crafting snapshot');
    }
    const unlocked = new Set(Array.from(data.unlocked, (id) => {
      if (typeof id !== 'string' || !id.trim()) throw new TypeError('Invalid recipe ID');
      return id;
    }));
    return () => set({ unlocked });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
}

export type CraftingStore = ReturnType<typeof createCraftingStore>;
export const CRAFTING_STORE_SERVICE = runtimeStoreServiceKey<CraftingStore>('crafting');
export const { useStore: useCraftingStore, useStoreApi: useCraftingStoreApi } = lazyScopedStore(
  'useCraftingStore', () => createCraftingStore(useInventoryStore, useWalletStore), () => useGaesupRuntime()?.craftingStore,
);
