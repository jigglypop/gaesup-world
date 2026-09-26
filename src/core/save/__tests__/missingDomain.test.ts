import { create } from 'zustand';

import { createBuildingPlugin } from '../../building/plugin';
import { createCameraPlugin } from '../../camera/plugin';
import { createNPCPlugin } from '../../npc/plugin';
import { createGaesupRuntime } from '../../runtime';
import { createWeatherPlugin } from '../../weather/plugin';
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

test('loading a slot written without the weather domain clears the weather instead of keeping the last slot', async () => {
  const adapter = memoryAdapter();
  const runtime = createGaesupRuntime({ saveOptions: { adapter }, plugins: [createWeatherPlugin()] });
  await runtime.setup();
  try {
    const blob = runtime.save.createBlob();
    delete blob.domains['weather'];
    await adapter.write('before-weather', blob);
    runtime.weatherStore.getState().setWeather('rain', 0.8, 3);

    expect(await runtime.save.load('before-weather')).toBe(true);
    expect(runtime.weatherStore.getState()).toMatchObject({ current: null, history: [] });
  } finally {
    await runtime.dispose();
  }
});

test('loading a slot without building, npc or camera data gives each of them a new session state', async () => {
  const adapter = memoryAdapter();
  const runtime = createGaesupRuntime({ saveOptions: { adapter }, plugins: [createBuildingPlugin(), createNPCPlugin(), createCameraPlugin()] });
  await runtime.setup();
  try {
    const blob = runtime.save.createBlob();
    for (const key of ['building', 'npc', 'camera']) delete blob.domains[key];
    await adapter.write('before-town', blob);
    const position = { x: 40, y: 0, z: 40 };
    runtime.buildingStore.getState().addBlock({ id: 'block', position, materialId: 'stone' });
    runtime.npcStore.getState().addInstance({ id: 'npc', templateId: 't', name: 'npc', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
    runtime.store.getState().setMode({ type: 'vehicle' });
    runtime.store.getState().setCameraOption({ zoom: 3 });
    runtime.store.getState().setUrls({ characterUrl: 'kept.glb' });

    expect(await runtime.save.load('before-town')).toBe(true);

    const building = runtime.buildingStore.getState();
    expect(building.blocks).toEqual([]);
    // A reused index would still report the removed block's cell as taken.
    expect(building.checkBlockPosition({ position })).toBe(false);
    expect(building.initialized).toBe(false);
    expect(runtime.npcStore.getState().instances.size).toBe(0);
    const camera = runtime.store.getState();
    expect(camera.mode.type).toBe('character');
    expect(camera.cameraOption.zoom).toBe(runtime.store.getInitialState().cameraOption.zoom);
    expect(camera.urls.characterUrl).toBe('kept.glb');
  } finally {
    await runtime.dispose();
  }
});
