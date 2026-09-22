import { act, renderHook } from '@testing-library/react';

import { getDialogRegistry } from '../../dialog/registry/DialogRegistry';
import { useDialogStore } from '../../dialog/stores/dialogStore';
import type { DialogTree } from '../../dialog/types';
import { acquireFarmingClock } from '../../farming/stores/clock';
import { useInventoryStore, useInventoryStoreApi } from '../../inventory/stores/inventoryStore';
import { compileNPCBrainBlueprint } from '../../npc/core/blueprint';
import { createNPCObservation } from '../../npc/core/brain';
import type { NPCBrainBlueprint, NPCInstance } from '../../npc/types';
import { getQuestRegistry } from '../../quests/registry/QuestRegistry';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('scoped hooks and imperative APIs follow a replaced Provider and leave the legacy store alone', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const legacy = useInventoryStore.getState();
  a.weatherStore.getState().setWeather('rain', 0.7, 0);
  b.weatherStore.getState().setWeather('sunny', 0.2, 0);
  let renders = 0;
  let active = a;
  const view = renderHook(() => {
    renders++;
    return { weather: useWeatherStore(s => s.current?.kind), slots: useInventoryStore(s => s.slots), inventory: useInventoryStoreApi() };
  }, { wrapper: ({ children }) => <GaesupRuntimeProvider runtime={active}>{children}</GaesupRuntimeProvider> });
  try {
    expect(view.result.current.weather).toBe('rain');
    expect(view.result.current.inventory).toBe(a.inventoryStore);
    active = b; view.rerender();
    expect(view.result.current.weather).toBe('sunny');
    expect(view.result.current.inventory).toBe(b.inventoryStore);
    const count = renders;
    act(() => { a.inventoryStore.getState().add('owned-item', 1); a.weatherStore.getState().setWeather('snow', 1, 1); });
    expect(renders).toBe(count);
    act(() => { view.result.current.inventory.getState().add('owned-item', 2); });
    expect(b.inventoryStore.getState().countOf('owned-item')).toBe(2);
    expect(useInventoryStore.getState()).toBe(legacy);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('farming subscriptions share only the same clock and plot pair and release independently', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const tickA = jest.fn(); const tickB = jest.fn();
  a.plotStore.setState({ tick: tickA }); b.plotStore.setState({ tick: tickB });
  const releaseA = acquireFarmingClock(a.timeStore, a.plotStore);
  const releaseAgain = acquireFarmingClock(a.timeStore, a.plotStore);
  const releaseB = acquireFarmingClock(a.timeStore, b.plotStore);
  try {
    expect(tickA).toHaveBeenCalledTimes(1); expect(tickB).toHaveBeenCalledTimes(1);
    releaseA(); releaseA();
    a.timeStore.getState().setTotalMinutes(10);
    expect(tickA).toHaveBeenCalledTimes(2); expect(tickB).toHaveBeenCalledTimes(2);
    releaseAgain(); a.timeStore.getState().setTotalMinutes(11);
    expect(tickA).toHaveBeenCalledTimes(2); expect(tickB).toHaveBeenCalledTimes(3);
    releaseB(); a.timeStore.getState().setTotalMinutes(12);
    expect(tickB).toHaveBeenCalledTimes(3);
  } finally { releaseA(); releaseAgain(); releaseB(); await a.dispose(); await b.dispose(); }
});

test('quest completion reentry is guarded per world while same-ID rewards in another world proceed', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const quests = getQuestRegistry(); const original = quests.all();
  const id = 'owned-reentrant-rewards';
  quests.register({ id, name: id, summary: '', objectives: [], rewards: [{ type: 'bells', amount: 20 }, { type: 'friendship', npcId: 'same-npc', amount: 5 }] });
  a.timeStore.getState().setTotalMinutes(1440 * 3); b.timeStore.getState().setTotalMinutes(1440 * 8);
  a.walletStore.getState().set(0); b.walletStore.getState().set(0);
  a.questStore.getState().start(id); b.questStore.getState().start(id);
  const outcomes: boolean[] = [];
  const off = a.walletStore.subscribe(() => {
    outcomes.push(a.questStore.getState().complete(id), b.questStore.getState().complete(id));
  });
  try {
    expect(a.questStore.getState().complete(id)).toBe(true);
    expect(outcomes).toEqual([false, true]);
    expect(a.walletStore.getState().bells).toBe(20); expect(b.walletStore.getState().bells).toBe(20);
    expect(a.friendshipStore.getState().entries['same-npc']?.lastGiftDay).toBe(3);
    expect(b.friendshipStore.getState().entries['same-npc']?.lastGiftDay).toBe(8);
  } finally { off(); quests.clear(); quests.registerAll(original); await a.dispose(); await b.dispose(); }
});

test('shop trade guard and inventory/wallet dependencies belong to each world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  for (const runtime of [a, b]) {
    runtime.walletStore.getState().set(100);
    runtime.shopStore.setState({ dailyStock: [{ itemId: 'owned-trade', price: 10, stock: 2 }] });
  }
  const results: boolean[] = [];
  const off = a.walletStore.subscribe(() => {
    results.push(a.shopStore.getState().buy('owned-trade').ok, b.shopStore.getState().buy('owned-trade').ok);
  });
  try {
    expect(a.shopStore.getState().buy('owned-trade').ok).toBe(true);
    expect(results).toEqual([false, true]);
    for (const runtime of [a, b]) {
      expect(runtime.walletStore.getState().bells).toBe(90);
      expect(runtime.inventoryStore.getState().countOf('owned-trade')).toBe(1);
      expect(runtime.shopStore.getState().dailyStock[0]?.stock).toBe(1);
    }
  } finally { off(); await a.dispose(); await b.dispose(); }
});

test('dialog conditions and effects use owned inventory, rewards, time, and quest objectives', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const dialogs = getDialogRegistry(); const originalGet = dialogs.get.bind(dialogs);
  const quests = getQuestRegistry(); const originalQuests = quests.all();
  const id = 'owned-dialog-effects';
  quests.register({ id, name: id, summary: '', objectives: [{ id: 'talk', type: 'talk', npcId: 'same-npc' }], rewards: [] });
  const tree: DialogTree = { id, startId: 'start', nodes: {
    start: { id: 'start', text: '', choices: [{ text: 'buy', condition: { type: 'hasBells', amount: 10 }, effects: [
      { type: 'takeBells', amount: 10 }, { type: 'giveItem', itemId: 'owned-dialog-item', count: 1 }, { type: 'addFriendship', npcId: 'same-npc', amount: 5 },
    ], next: null }] },
  } };
  const get = jest.spyOn(dialogs, 'get').mockImplementation(key => key === id ? tree : originalGet(key));
  await a.setup(); await b.setup();
  a.walletStore.getState().set(30); b.walletStore.getState().set(0); a.timeStore.getState().setTotalMinutes(1440 * 4);
  for (const runtime of [a, b]) runtime.questStore.getState().start(id);
  const legacyRunner = useDialogStore.getState().runner;
  try {
    a.dialogStore.getState().start(id, { context: { npcId: 'same-npc' } });
    b.dialogStore.getState().start(id);
    expect(a.questStore.getState().state[id]?.progress['talk']).toBe(1);
    expect(b.questStore.getState().state[id]?.progress['talk'] ?? 0).toBe(0);
    b.dialogStore.getState().choose(0);
    expect(b.dialogStore.getState().node?.id).toBe('start');
    a.dialogStore.getState().choose(0);
    expect(a.walletStore.getState().bells).toBe(20);
    expect(a.inventoryStore.getState().countOf('owned-dialog-item')).toBe(1);
    expect(a.friendshipStore.getState().entries['same-npc']?.lastGiftDay).toBe(4);
    expect(b.inventoryStore.getState().countOf('owned-dialog-item')).toBe(0);
    a.dialogStore.getState().start(id); await a.dispose();
    expect(a.dialogStore.getState().runner).toBeNull(); expect(b.dialogStore.getState().runner).not.toBeNull();
    expect(useDialogStore.getState().runner).toBe(legacyRunner);
  } finally { await a.dispose(); await b.dispose(); get.mockRestore(); quests.clear(); quests.registerAll(originalQuests); }
});

test('NPC blueprint conditions read the selected world quest and friendship state', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const blueprint: NPCBrainBlueprint = { id: 'condition-ownership', name: '', nodes: [
    { id: 'quest', type: 'condition', condition: { type: 'questStatus', questId: 'same-quest', status: 'completed' } },
    { id: 'friend', type: 'condition', condition: { type: 'friendshipAtLeast', score: 5 } },
    { id: 'speak', type: 'action', action: { type: 'speak', text: 'known' } },
  ], edges: [{ id: 'q', source: 'quest', target: 'friend', branch: 'true' }, { id: 'f', source: 'friend', target: 'speak', branch: 'true' }] };
  const instance: NPCInstance = { id: 'same-npc', templateId: 'template', name: '', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
  a.questStore.setState({ state: { 'same-quest': { questId: 'same-quest', status: 'completed', progress: {} } } });
  a.friendshipStore.getState().add('same-npc', 5, 0);
  try {
    const observation = createNPCObservation(instance, new Map(), 0);
    expect(compileNPCBrainBlueprint(blueprint, observation, a)).toEqual([{ type: 'speak', text: 'known' }]);
    expect(compileNPCBrainBlueprint(blueprint, observation, b)).toEqual([]);
  } finally { await a.dispose(); await b.dispose(); }
});
