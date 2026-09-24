import { SEED_ITEMS, registerSeedItems } from '../data/items';
import { getItemRegistry } from '../registry/ItemRegistry';
import type { ItemDef } from '../types';

const item = (id: string, overrides: Partial<ItemDef> = {}): ItemDef => ({
  id,
  name: id,
  icon: `${id}.png`,
  category: 'material',
  stackable: true,
  maxStack: 99,
  ...overrides,
});

afterEach(() => getItemRegistry().clear());

describe('ItemRegistry', () => {
  test('is one shared registry', () => {
    expect(getItemRegistry()).toBe(getItemRegistry());
  });

  test('stores a frozen copy, so later edits to the source do not leak in', () => {
    const registry = getItemRegistry();
    const source = item('wood');
    registry.register(source);
    source.name = 'changed';

    const stored = registry.require('wood');
    expect(stored).not.toBe(source);
    expect(stored.name).toBe('wood');
    expect(Object.isFrozen(stored)).toBe(true);
  });

  test('keeps the first definition for a repeated id', () => {
    const registry = getItemRegistry();
    registry.registerAll([item('stone', { maxStack: 10 }), item('stone', { maxStack: 1 }), item('fish', { category: 'fish' })]);

    expect(registry.get('stone')?.maxStack).toBe(10);
    expect(registry.all().map((def) => def.id)).toEqual(['stone', 'fish']);
  });

  test('lookups report missing ids, and clear empties the registry', () => {
    const registry = getItemRegistry();
    registry.register(item('apple', { category: 'food' }));

    expect(registry.has('apple')).toBe(true);
    expect(registry.get('pear')).toBeUndefined();
    expect(() => registry.require('pear')).toThrow('Unknown ItemId: pear');

    registry.clear();
    expect(registry.has('apple')).toBe(false);
    expect(registry.all()).toEqual([]);
  });

  test('registerSeedItems registers every seed item', () => {
    registerSeedItems();
    const registry = getItemRegistry();
    expect(SEED_ITEMS.every((seed) => registry.has(seed.id))).toBe(true);
  });
});
