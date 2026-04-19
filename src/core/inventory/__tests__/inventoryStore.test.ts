import { registerSeedItems } from '../../items/data/items';
import { useInventoryStore } from '../stores/inventoryStore';

beforeAll(() => {
  registerSeedItems();
});

beforeEach(() => {
  useInventoryStore.getState().clear();
  useInventoryStore.getState().setEquippedHotbar(0);
});

describe('inventoryStore', () => {
  test('add stacks within maxStack', () => {
    const left = useInventoryStore.getState().add('apple', 3);
    expect(left).toBe(0);
    expect(useInventoryStore.getState().countOf('apple')).toBe(3);
  });

  test('add overflows into multiple slots if needed', () => {
    useInventoryStore.getState().add('apple', 99);
    useInventoryStore.getState().add('apple', 50);
    expect(useInventoryStore.getState().countOf('apple')).toBe(149);
  });

  test('non-stackable tools occupy one slot each', () => {
    useInventoryStore.getState().add('axe', 1);
    useInventoryStore.getState().add('axe', 1);
    expect(useInventoryStore.getState().countOf('axe')).toBe(2);
    const occupied = useInventoryStore.getState().slots.filter(Boolean).length;
    expect(occupied).toBe(2);
  });

  test('removeById subtracts across slots', () => {
    useInventoryStore.getState().add('wood', 5);
    const removed = useInventoryStore.getState().removeById('wood', 3);
    expect(removed).toBe(3);
    expect(useInventoryStore.getState().countOf('wood')).toBe(2);
  });

  test('serialize / hydrate round-trip', () => {
    useInventoryStore.getState().add('apple', 7);
    useInventoryStore.getState().add('axe', 1);
    useInventoryStore.getState().setEquippedHotbar(2);
    const blob = useInventoryStore.getState().serialize();
    useInventoryStore.getState().clear();
    useInventoryStore.getState().setEquippedHotbar(0);
    expect(useInventoryStore.getState().countOf('apple')).toBe(0);

    useInventoryStore.getState().hydrate(blob);
    expect(useInventoryStore.getState().countOf('apple')).toBe(7);
    expect(useInventoryStore.getState().countOf('axe')).toBe(1);
  });

  test('move swaps two slots', () => {
    useInventoryStore.getState().add('apple', 1);
    useInventoryStore.getState().add('wood', 1);
    useInventoryStore.getState().move(0, 1);
    const slots = useInventoryStore.getState().slots;
    expect(slots[0]?.itemId).toBe('wood');
    expect(slots[1]?.itemId).toBe('apple');
  });

  test('move into empty slot transfers without swap loss', () => {
    useInventoryStore.getState().add('apple', 1);
    useInventoryStore.getState().move(0, 5);
    const slots = useInventoryStore.getState().slots;
    expect(slots[0]).toBeNull();
    expect(slots[5]?.itemId).toBe('apple');
  });
});
