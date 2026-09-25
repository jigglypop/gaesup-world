import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, createFarmingPlugin, createInventoryPlugin, createEconomyPlugin, createQuestsPlugin, createRelationsPlugin, createWeatherPlugin, GaesupRuntimeProvider, getCropRegistry, getQuestRegistry, usePlotStore, useInventoryStore, useWalletStore, useShopStore, useQuestStore, useFriendshipStore, useWeatherStore } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function worldGameplay(ctx: ScenarioContext) {
  const identity = `gameplay-lab-${crypto.randomUUID()}`;
  const stores = [usePlotStore, useInventoryStore, useWalletStore, useShopStore, useQuestStore, useFriendshipStore, useWeatherStore] as const;
  const restore = stores.map(store => { const state = store.getState(); return () => (store.setState as (value: unknown) => void)(state); });
  const crops = getCropRegistry(); const previousCrops = crops.all();
  const quests = getQuestRegistry(); const previousQuests = quests.all();
  crops.register({ id: identity, name: '검증 작물', seedItemId: `${identity}:seed`, yieldItemId: `${identity}:yield`, yieldCount: 1, stages: [{ durationMinutes: 30, scale: 0.5 }, { durationMinutes: 0, scale: 1 }], waterIntervalMinutes: 120, driedOutMinutes: 240 });
  quests.register({ id: identity, name: '검증 퀘스트', summary: '', objectives: [], rewards: [{ type: 'bells', amount: 20 }, { type: 'friendship', npcId: 'same-npc', amount: 5 }] });
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, plugins: [createFarmingPlugin(), createInventoryPlugin(), createEconomyPlugin(), createQuestsPlugin(), createRelationsPlugin(), createWeatherPlugin()] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  type Service<T> = { getState: () => T };
  const service = <T,>(runtime: typeof a, id: string) => runtime.requireService<Service<T>>(id);
  const view: Record<string, { weather: string; plot: string; wallet: number }> = {};
  function Consumer({ id }: { id: string }) {
    const weather = useWeatherStore(s => s.current?.kind ?? 'none');
    const plot = usePlotStore(s => s.plots['same-plot']?.state ?? 'missing');
    const wallet = useWalletStore(s => s.bells); view[id] = { weather, plot, wallet };
    return <p>월드 {id}: {weather} / 작물 {plot} / 잔액 {wallet}</p>;
  }
  try {
    a.timeStore.getState().setTotalMinutes(0); b.timeStore.getState().setTotalMinutes(0);
    await a.setup(); await b.setup();
    const plotsA = service<ReturnType<typeof usePlotStore.getState>>(a, 'farming.store'); const plotsB = service<ReturnType<typeof usePlotStore.getState>>(b, 'farming.store');
    const inventoryA = service<ReturnType<typeof useInventoryStore.getState>>(a, 'inventory.store'); const inventoryB = service<ReturnType<typeof useInventoryStore.getState>>(b, 'inventory.store');
    const walletA = service<ReturnType<typeof useWalletStore.getState>>(a, 'wallet.store'); const walletB = service<ReturnType<typeof useWalletStore.getState>>(b, 'wallet.store');
    const questsA = service<ReturnType<typeof useQuestStore.getState>>(a, 'quests.store'); const questsB = service<ReturnType<typeof useQuestStore.getState>>(b, 'quests.store');
    const weatherA = service<ReturnType<typeof useWeatherStore.getState>>(a, 'weather.store'); const weatherB = service<ReturnType<typeof useWeatherStore.getState>>(b, 'weather.store');
    for (const [plots, inventory] of [[plotsA, inventoryA], [plotsB, inventoryB]] as const) {
      plots.getState().registerPlot({ id: 'same-plot', position: [0, 0, 0] }); plots.getState().till('same-plot');
      inventory.getState().add(`${identity}:seed`, 1); plots.getState().plant('same-plot', identity, 0);
    }
    weatherA.getState().setWeather('rain'); weatherB.getState().setWeather('sunny');
    walletA.getState().set(100); walletB.getState().set(1000);
    questsA.getState().start(identity); questsB.getState().start(identity); questsA.getState().complete(identity);
    a.timeStore.getState().setTotalMinutes(60);
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>));
    await nextFrame(ctx.signal);
    ctx.assert('A-weather', 'rain', view['A']!.weather); ctx.assert('B-weather', 'sunny', view['B']!.weather);
    ctx.assert('A-crop-mature', 'mature', view['A']!.plot); ctx.assert('B-crop-still-growing', 'planted', view['B']!.plot);
    ctx.assert('A-own-reward', 120, walletA.getState().bells); ctx.assert('B-no-foreign-reward', 1000, walletB.getState().bells);
    ctx.assert('B-own-quest-still-active', 'active', questsB.getState().statusOf(identity));
    ctx.sample('weather-state-leaks', Number(view['A']!.weather !== 'rain'), 'count', 'two-world-weather-hooks');
    ctx.sample('crop-clock-leaks', Number(view['B']!.plot !== 'planted'), 'count', 'real-farming-plugin-clock');
    ctx.sample('reward-balance-mismatches', Number(walletA.getState().bells !== 120) + Number(walletB.getState().bells !== 1000), 'count', 'quest-to-wallet-dependencies');
    ctx.sample('quest-state-leaks', Number(questsB.getState().statusOf(identity) !== 'active'), 'count', 'same-quest-id-independent-completion');
    ctx.assert('A-harvest-succeeds', true, plotsA.getState().harvest('same-plot'));
    ctx.assert('A-owned-harvest', 1, inventoryA.getState().countOf(`${identity}:yield`));
    ctx.assert('B-no-foreign-harvest', 0, inventoryB.getState().countOf(`${identity}:yield`));
    ctx.sample('harvest-inventory-leaks', Number(inventoryB.getState().countOf(`${identity}:yield`) !== 0), 'count', 'farming-to-inventory-dependency');
    await a.save.save('main'); await b.save.save('main');
    weatherA.getState().setWeather('storm'); walletA.getState().set(999); inventoryA.getState().clear(); await a.save.load('main');
    const saveMismatches = Number(weatherA.getState().current?.kind !== 'rain') + Number(walletA.getState().bells !== 120) + Number(inventoryA.getState().countOf(`${identity}:yield`) !== 1);
    ctx.assert('A-gameplay-save-restored', 0, saveMismatches); ctx.sample('gameplay-save-mismatches', saveMismatches, 'count', 'actual-indexeddb-gameplay-bindings');
    await a.dispose(); b.timeStore.getState().setTotalMinutes(60);
    ctx.assert('B-clock-continues-after-A-dispose', 'mature', plotsB.getState().plots['same-plot']?.state ?? 'missing');
  } finally {
    flushSync(() => root.unmount()); await a.save.remove('main'); await b.save.remove('main'); await a.dispose(); await b.dispose();
    for (const apply of restore) apply(); crops.clear(); crops.registerAll(previousCrops); quests.clear(); quests.registerAll(previousQuests);
  }
}

export const gameplayScenarios: Scenario[] = [
  { id: 'world-gameplay', title: '두 월드의 날씨·작물·보상·저장', description: '실제 농사 clock과 퀘스트 보상이 해당 월드의 작물·가방·지갑만 변경하는지, 저장 복원 후에도 격리되는지 검사합니다.', version: 1, run: worldGameplay },
];
