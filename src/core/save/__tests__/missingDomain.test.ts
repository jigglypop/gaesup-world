import { create } from 'zustand';

import { createInventoryPlugin } from '../../inventory/plugin';
import { createGaesupRuntime } from '../../runtime';
import { createStoreReset } from '../core/reset';
import { SaveSystem } from '../core/SaveSystem';
import type { SaveAdapter, SaveBlob } from '../types';

function memoryAdapter(): SaveAdapter & { slots: Map<string, SaveBlob> } {
  const slots = new Map<string, SaveBlob>();
  return {
    slots,
    read: async (slot) => slots.get(slot) ?? null,
    write: async (slot, blob) => { slots.set(slot, JSON.parse(JSON.stringify(blob)) as SaveBlob); },
    list: async () => [...slots.keys()],
    remove: async (slot) => { slots.delete(slot); },
  };
}

test('a save without a domain resets the domains that can reset and leaves the rest as they are', async () => {
  const adapter = memoryAdapter();
  const save = new SaveSystem({ adapter });
  let world = 'meadow';
  let inventory = ['sword'];
  const legacy = { value: 'kept' };
  save.register({ key: 'world', serialize: () => world, hydrate: (data) => { world = data as string; } });
  save.register({ key: 'inventory', serialize: () => inventory, hydrate: (data) => { inventory = data as string[]; }, reset: () => { inventory = []; } });
  save.register({ key: 'legacy', serialize: () => legacy.value, hydrate: () => {} });
  // Written before the inventory and legacy domains existed.
  await adapter.write('old', { version: 1, savedAt: 1, domains: { world: 'beach' } });

  expect(await save.load('old')).toBe(true);
  expect([world, inventory, legacy.value]).toEqual(['beach', [], 'kept']);
});

test('a load that fails validation applies no reset either', async () => {
  const adapter = memoryAdapter();
  const save = new SaveSystem({ adapter });
  let inventory = ['sword'];
  save.register({ key: 'inventory', serialize: () => inventory, hydrate: (data) => { inventory = data as string[]; }, reset: () => { inventory = []; } });
  save.register({
    key: 'world', serialize: () => 'meadow', hydrate: () => {},
    prepareHydrate: (data) => { if (data !== 'meadow') throw new TypeError('Invalid world'); return () => {}; },
  });
  await adapter.write('broken', { version: 1, savedAt: 1, domains: { world: 'lava' } });

  await expect(save.load('broken')).rejects.toThrow();
  expect(inventory).toEqual(['sword']);
});

test('a store reset restores construction state and counts as a restore for trackers', () => {
  const store = create<{ items: string[]; hydrationRevision: number; add: (item: string) => void }>((set, get) => ({
    items: [], hydrationRevision: 0, add: (item) => set({ items: [...get().items, item] }),
  }));
  store.getState().add('wood');
  createStoreReset(store)!();

  expect(store.getState()).toMatchObject({ items: [], hydrationRevision: 1 });
  store.getState().add('stone');
  expect(store.getState().items).toEqual(['stone']);
  expect(createStoreReset({ getState: () => ({}) })).toBeUndefined();
});

test('loading a slot written without the inventory domain empties the inventory instead of keeping the last slot', async () => {
  const adapter = memoryAdapter();
  const runtime = createGaesupRuntime({ saveOptions: { adapter }, plugins: [createInventoryPlugin()] });
  await runtime.setup();
  try {
    const blob = runtime.save.createBlob();
    delete blob.domains['inventory'];
    await adapter.write('before-inventory', blob);
    runtime.inventoryStore.getState().add('wood', 3);

    expect(await runtime.save.load('before-inventory')).toBe(true);
    expect(runtime.inventoryStore.getState().countOf('wood')).toBe(0);
  } finally {
    await runtime.dispose();
  }
});
