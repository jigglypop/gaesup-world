import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { useWalletStore } from '../../economy/stores/walletStore';
import { getRecipeRegistry } from '../registry/RecipeRegistry';
import { useCraftingStore } from '../stores/craftingStore';
import type { RecipeDef } from '../types';

const R_FREE: RecipeDef = {
  id: 'r.test.free',
  name: 'Free Plank',
  ingredients: [{ itemId: 'wood', count: 2 }],
  output: { itemId: 'wood', count: 1 },
  unlockedByDefault: true,
};

const R_LOCKED: RecipeDef = {
  id: 'r.test.locked',
  name: 'Locked Tool',
  ingredients: [{ itemId: 'wood', count: 1 }],
  output: { itemId: 'apple', count: 1 },
};

const R_PRICED: RecipeDef = {
  id: 'r.test.priced',
  name: 'Priced Apple',
  ingredients: [{ itemId: 'wood', count: 1 }],
  output: { itemId: 'apple', count: 1 },
  requireBells: 30,
  unlockedByDefault: true,
};

beforeAll(() => {
  registerSeedItems();
  getRecipeRegistry().clear();
  getRecipeRegistry().registerAll([R_FREE, R_LOCKED, R_PRICED]);
});

beforeEach(() => {
  useCraftingStore.setState({ unlocked: new Set() });
  useInventoryStore.setState({
    slots: new Array(useInventoryStore.getState().slots.length).fill(null),
  });
  useWalletStore.setState({ bells: 0, lifetimeEarned: 0, lifetimeSpent: 0 });
});

describe('craftingStore', () => {
  test('canCraft returns false when ingredients missing', () => {
    const r = useCraftingStore.getState().canCraft('r.test.free');
    expect(r.ok).toBe(false);
  });

  test('craft consumes ingredients and produces output', () => {
    useInventoryStore.getState().add('wood', 2);
    const r = useCraftingStore.getState().craft('r.test.free');
    expect(r.ok).toBe(true);
    expect(useInventoryStore.getState().countOf('wood')).toBe(1);
  });

  test('locked recipe rejects until unlocked', () => {
    useInventoryStore.getState().add('wood', 5);
    expect(useCraftingStore.getState().canCraft('r.test.locked').ok).toBe(false);
    useCraftingStore.getState().unlock('r.test.locked');
    expect(useCraftingStore.getState().canCraft('r.test.locked').ok).toBe(true);
  });

  test('requireBells consumed on craft', () => {
    useInventoryStore.getState().add('wood', 1);
    useWalletStore.getState().add(50);
    const r = useCraftingStore.getState().craft('r.test.priced');
    expect(r.ok).toBe(true);
    expect(useWalletStore.getState().bells).toBe(20);
  });

  test('insufficient bells blocks craft', () => {
    useInventoryStore.getState().add('wood', 1);
    const r = useCraftingStore.getState().canCraft('r.test.priced');
    expect(r.ok).toBe(false);
  });

  test('serialize/hydrate roundtrip', () => {
    useCraftingStore.getState().unlock('r.test.locked');
    const blob = useCraftingStore.getState().serialize();
    useCraftingStore.setState({ unlocked: new Set() });
    useCraftingStore.getState().hydrate(blob);
    expect(useCraftingStore.getState().isUnlocked('r.test.locked')).toBe(true);
  });
});
