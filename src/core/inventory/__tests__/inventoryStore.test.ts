import { getItemRegistry } from '../../items/registry/ItemRegistry';
import type { ItemDef } from '../../items/types';
import { useInventoryStore } from '../stores/inventoryStore';
import type { InventorySerialized } from '../types';
import { createInventoryPlugin } from '../plugin';
import { createGaesupRuntime } from '../../runtime';
import { SaveSystem } from '../../save';

const TEST_ITEMS: ItemDef[] = [
  { id: 'apple', name: 'apple', icon: 'apple', category: 'food', stackable: true, maxStack: 99 },
  { id: 'wood', name: 'wood', icon: 'wood', category: 'material', stackable: true, maxStack: 99 },
  { id: 'axe', name: 'axe', icon: 'axe', category: 'tool', stackable: false, maxStack: 1 },
];

beforeAll(() => {
  getItemRegistry().registerAll(TEST_ITEMS);
});

beforeEach(() => {
  useInventoryStore.getState().clear();
  useInventoryStore.getState().setEquippedHotbar(0);
});

describe('inventoryStore', () => {
  test.each([NaN, Infinity, -Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    'invalid quantities and hotbar indices preserve a restorable inventory: %s', (value) => {
      useInventoryStore.getState().add('apple', 4);
      const previous = useInventoryStore.getState();
      expect(previous.add('apple', value)).toBe(value <= 0 ? 0 : value);
      expect(previous.remove(0, value)).toBe(false);
      expect(previous.removeById('apple', value)).toBe(0);
      previous.setEquippedHotbar(value);
      expect(useInventoryStore.getState()).toBe(previous);
      expect(previous.countOf('apple')).toBe(4);
      const snapshot = JSON.parse(JSON.stringify(previous.serialize())) as InventorySerialized;
      previous.hydrate(snapshot);
      expect(useInventoryStore.getState().serialize()).toEqual(snapshot);
    },
  );

  test('empty item IDs cannot create slots rejected by save hydration', () => {
    const previous = useInventoryStore.getState();
    expect(previous.add(' ', 2)).toBe(2);
    expect(useInventoryStore.getState()).toBe(previous);
  });

  test.each([NaN, Infinity, 1.5])('invalid stack limits cannot create invalid quantities: %s', (maxStack) => {
    const itemId = `invalid-stack-${maxStack}`;
    getItemRegistry().register({ ...TEST_ITEMS[0]!, id: itemId, maxStack });
    expect(useInventoryStore.getState().add(itemId, 2)).toBe(0);
    const inventory = useInventoryStore.getState();
    expect(inventory.slots.filter((slot) => slot?.itemId === itemId)).toHaveLength(2);
    expect(() => inventory.prepareHydrate(inventory.serialize())).not.toThrow();
  });

  test('whole-number hotbar indices still wrap in either direction', () => {
    const inventory = useInventoryStore.getState();
    inventory.setEquippedHotbar(-1);
    expect(useInventoryStore.getState().equippedHotbar).toBe(inventory.hotbar.length - 1);
    inventory.setEquippedHotbar(inventory.hotbar.length);
    expect(useInventoryStore.getState().equippedHotbar).toBe(0);
  });

  test.each([
    { version: 2 }, { slots: [{ itemId: 'apple', count: -1 }] },
    { slots: [{ itemId: 'apple', count: NaN }] }, { slots: [{ itemId: 'apple', count: 1.5 }] },
    { hotbar: [99] }, { hotbar: [0.5] }, { equippedHotbar: Infinity },
  ])('rejects malformed snapshots without changing inventory: %j', (invalid) => {
    const previous = useInventoryStore.getState();
    const data = { ...previous.serialize(), ...invalid };
    expect(() => previous.prepareHydrate(data)).toThrow(TypeError);
    expect(useInventoryStore.getState()).toBe(previous);
  });

  test('defers application and owns slot data; empty hotbars stay finite', () => {
    const previous = useInventoryStore.getState();
    try {
      const data: InventorySerialized = { version: 1, slots: [{ itemId: 'apple', count: 2 }], hotbar: [0], equippedHotbar: 0 };
      const apply = previous.prepareHydrate(data);
      data.slots[0]!.count = 99;
      expect(useInventoryStore.getState()).toBe(previous);
      apply();
      expect(useInventoryStore.getState().countOf('apple')).toBe(2);
      useInventoryStore.getState().hydrate({ version: 1, slots: [], hotbar: [], equippedHotbar: 0 });
      useInventoryStore.getState().setEquippedHotbar(1);
      expect(useInventoryStore.getState().equippedHotbar).toBe(0);
    } finally { useInventoryStore.setState(previous); }
  });

  test('runtime forwards inventory preparation before other domains apply', async () => {
    const save = new SaveSystem({ adapter: {
      read: async () => null, write: async () => undefined,
      list: async () => [], remove: async () => undefined,
    } });
    const hydrate = jest.fn();
    const runtime = createGaesupRuntime({ saveSystem: save, plugins: [createInventoryPlugin()],
      saveBindings: [{ key: 'earlier', serialize: () => null, hydrate }], logger: { warn: () => undefined } });
    await runtime.setup();
    try {
      expect(() => save.hydrateBlob({ version: 1, savedAt: 1, domains: { inventory: {
        version: 1, slots: [{ itemId: 'apple', count: -1 }], hotbar: [0], equippedHotbar: 0,
      } } })).toThrow('Save hydration failed');
      expect(hydrate).not.toHaveBeenCalled();
    } finally { await runtime.dispose(); }
  });

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

  test.each([[0, 0], [0, NaN], [NaN, 0], [0, 0.5], [0.5, 0], [0, Infinity]])(
    'invalid or same-slot movement preserves inventory (%s, %s)', (from, to) => {
      useInventoryStore.getState().add('apple', 4);
      const previous = useInventoryStore.getState();
      previous.move(from, to);
      expect(useInventoryStore.getState()).toBe(previous);
      expect(previous.countOf('apple')).toBe(4);
    },
  );

  test('move into empty slot transfers without swap loss', () => {
    useInventoryStore.getState().add('apple', 1);
    useInventoryStore.getState().move(0, 5);
    const slots = useInventoryStore.getState().slots;
    expect(slots[0]).toBeNull();
    expect(slots[5]?.itemId).toBe('apple');
  });
});
