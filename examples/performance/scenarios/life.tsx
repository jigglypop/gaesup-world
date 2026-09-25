import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, createCatalogPlugin, createCraftingPlugin, createMailPlugin, createTownPlugin, createEventsPlugin, createInventoryPlugin, createEconomyPlugin, getRecipeRegistry, getEventRegistry, getToolEvents, useToolUse, useCatalogTracker, useEventsTicker, useCatalogStore, useCraftingStore, useMailStore, useTownStore, useEventsStore, useInventoryStore, useWalletStore } from 'gaesup-world';
import { GameplayEventEngine } from 'gaesup-world/gameplay';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function worldLife(ctx: ScenarioContext) {
  const identity = `life-lab-${crypto.randomUUID()}`;
  const stores = [useCatalogStore, useCraftingStore, useMailStore, useTownStore, useEventsStore, useInventoryStore, useWalletStore] as const;
  const restore = stores.map(store => { const state = store.getState(); return () => (store.setState as (value: unknown) => void)(state); });
  const recipes = getRecipeRegistry(); const previousRecipes = recipes.all();
  const events = getEventRegistry(); const previousEvents = events.all();
  recipes.register({ id: identity, name: identity, ingredients: [{ itemId: `${identity}:ingredient`, count: 1 }], output: { itemId: `${identity}:crafted`, count: 1 }, requireBells: 10 });
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, plugins: [createCatalogPlugin(), createCraftingPlugin(), createMailPlugin(), createTownPlugin(), createEventsPlugin(), createInventoryPlugin(), createEconomyPlugin()] });
  const a = make('a'); const b = make('b'); const root = createRoot(ctx.host);
  type Store<T> = { getState: () => T };
  const service = <T,>(runtime: typeof a, id: string) => runtime.requireService<Store<T>>(id);
  const bus = (runtime: typeof a) => (runtime as typeof a & { toolEvents?: ReturnType<typeof getToolEvents> }).toolEvents ?? getToolEvents();
  const engine = (runtime: typeof a) => (runtime as typeof a & { gameplayEvents?: GameplayEventEngine }).gameplayEvents ?? new GameplayEventEngine();
  const hits: Record<string, number> = { A: 0, B: 0 };
  const observed: Record<string, number> = {};
  function Consumer({ id }: { id: string }) {
    useCatalogTracker(); useEventsTicker();
    useToolUse('shovel', () => { hits[id]!++; });
    observed[id] = useCatalogStore(s => s.entries[`${identity}:marker`]?.totalCollected ?? 0);
    return <p>월드 {id}: 도감 수집 {observed[id]}</p>;
  }
  const emit = (runtime: typeof a) => bus(runtime).emit({ kind: 'shovel', origin: [0, 0, 0], direction: [0, 0, 1], range: 2, timestamp: 1 });
  try {
    a.timeStore.getState().setTotalMinutes(0); b.timeStore.getState().setTotalMinutes(1440);
    const timeA = a.timeStore.getState().time;
    events.register({ id: identity, name: identity, triggers: [{ kind: 'monthDay', month: timeA.month, day: timeA.day }], tags: [identity] });
    await a.setup(); await b.setup();
    const catalogA = service<ReturnType<typeof useCatalogStore.getState>>(a, 'catalog.store'); const catalogB = service<ReturnType<typeof useCatalogStore.getState>>(b, 'catalog.store');
    const craftA = service<ReturnType<typeof useCraftingStore.getState>>(a, 'crafting.store'); const craftB = service<ReturnType<typeof useCraftingStore.getState>>(b, 'crafting.store');
    const mailA = service<ReturnType<typeof useMailStore.getState>>(a, 'mail.store'); const mailB = service<ReturnType<typeof useMailStore.getState>>(b, 'mail.store');
    const townA = service<ReturnType<typeof useTownStore.getState>>(a, 'town.store'); const townB = service<ReturnType<typeof useTownStore.getState>>(b, 'town.store');
    const eventsA = service<ReturnType<typeof useEventsStore.getState>>(a, 'events.store'); const eventsB = service<ReturnType<typeof useEventsStore.getState>>(b, 'events.store');
    townA.getState().registerHouse({ id: 'same-house', position: [0, 0, 0] }); townB.getState().registerHouse({ id: 'same-house', position: [7, 0, 0] });
    a.walletStore.getState().set(100); b.walletStore.getState().set(1000);
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>));
    flushSync(() => { a.inventoryStore.getState().add(`${identity}:marker`, 1); a.inventoryStore.getState().add(`${identity}:ingredient`, 1); });
    craftA.getState().unlock(identity);
    const crafted = craftA.getState().craft(identity).ok;
    const mail = { id: 'same-mail', from: 'lab', subject: 'attachment', body: '', sentDay: 0, attachments: [{ bells: 5 }] };
    mailA.getState().send(mail); mailB.getState().send(mail); mailA.getState().claim('same-mail');
    emit(a); await nextFrame(ctx.signal);
    const check = (metric: string, mismatches: number, scope: string) => { ctx.sample(metric, mismatches, 'count', scope); ctx.assert(metric, 0, mismatches); };
    check('catalog-state-leaks', Number(observed['A'] !== 1) + Number(observed['B'] !== 0), 'actual-catalog-tracker-hooks');
    check('crafting-owner-mismatches', Number(!crafted) + Number(craftB.getState().isUnlocked(identity)), 'crafting-to-owned-inventory-and-wallet');
    check('mail-owner-mismatches', Number(a.walletStore.getState().bells !== 95) + Number(b.walletStore.getState().bells !== 1000) + Number(mailB.getState().messages.find(m => m.id === 'same-mail')?.claimed !== false), 'same-id-mail-and-wallet');
    check('town-state-leaks', Number(townB.getState().houses['same-house']?.position[0] !== 7), 'same-id-house-position');
    check('calendar-state-leaks', Number(!eventsA.getState().isActive(identity)) + Number(eventsB.getState().isActive(identity)), 'actual-events-ticker-two-days');
    check('tool-event-leaks', Number(hits['A'] !== 1) + Number(hits['B'] !== 0), 'actual-tool-hook-and-bus');
    const engineA = engine(a);
    engineA.setBlueprints([{ id: identity, name: identity, trigger: { type: 'manual', key: 'run' }, conditions: [{ type: 'hasItem', itemId: `${identity}:marker` }], actions: [{ type: 'giveItem', itemId: `${identity}:event-reward` }], policy: { run: 'once' } }]);
    await engineA.dispatch({ type: 'manual', key: 'run' });
    check('event-reward-mismatches', Number(a.inventoryStore.getState().countOf(`${identity}:event-reward`) !== 1) + Number(b.inventoryStore.getState().countOf(`${identity}:event-reward`) !== 0), 'actual-event-engine-dependency-ports');
    await a.save.save('main'); await b.save.save('main');
    catalogA.getState().hydrate({ version: 1, entries: {} }); townA.getState().unregisterHouse('same-house'); await a.save.load('main');
    check('life-save-mismatches', Number(!catalogA.getState().has(`${identity}:marker`)) + Number(catalogB.getState().has(`${identity}:marker`)) + Number(townB.getState().houses['same-house']?.position[0] !== 7), 'actual-indexeddb-life-bindings');
    const before = hits['A']!; await a.dispose(); await nextFrame(ctx.signal); emit(b);
    check('tool-after-dispose-leaks', Number(hits['A'] !== before), 'mounted-hook-runtime-disposal');
    await a.setup(); await nextFrame(ctx.signal); const after = hits['A']!; const other = hits['B']!; emit(a);
    check('tool-restart-mismatches', Number(hits['A'] !== after + 1) + Number(hits['B'] !== other), 'mounted-hook-runtime-restart');
  } finally {
    flushSync(() => root.unmount()); await a.save.remove('main'); await b.save.remove('main'); await a.dispose(); await b.dispose();
    for (const apply of restore) apply(); recipes.clear(); recipes.registerAll(previousRecipes); events.clear(); events.registerAll(previousEvents);
  }
}

export const lifeScenarios: Scenario[] = [
  { id: 'world-life', title: '두 월드의 생활·도구·이벤트', description: '실제 도감·달력·도구 훅과 제작·우편·게임플레이 이벤트·IndexedDB를 연결해 월드 간 전달과 종료·재시작을 검사합니다.', version: 1, run: worldLife },
];
