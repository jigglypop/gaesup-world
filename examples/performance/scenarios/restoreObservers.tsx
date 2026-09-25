import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, createTimePlugin, createWeatherPlugin, createEventsPlugin, createQuestsPlugin, createInventoryPlugin, createFarmingPlugin, getEventRegistry, getQuestRegistry, useWeatherTicker, useEventsTicker, useQuestObjectiveTracker, SaveSystem, type SaveBlob } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

const check = (ctx: ScenarioContext, id: string, actual: number, expected = 0) => { ctx.sample(id, actual, 'count', 'real-world-stores-and-observer-hooks'); ctx.assert(id, expected, actual); };

async function observers(ctx: ScenarioContext) {
  const id = `observers-${crypto.randomUUID()}`; const root = createRoot(ctx.host);
  const events = getEventRegistry(); const previousEvents = events.all(); const quests = getQuestRegistry(); const previousQuests = quests.all();
  const make = (name: string) => createGaesupRuntime({ worldId: `${id}:${name}`, plugins: [createTimePlugin(), createWeatherPlugin(), createEventsPlugin(), createQuestsPlugin(), createInventoryPlugin(), createFarmingPlugin()] });
  const a = make('a'); const b = make('b'); const hits = [0, 0];
  const counts = { weather: 0, events: 0, quests: 0, farming: 0 }; let timeSubscriptions = 0; let inventorySubscriptions = 0;
  const timeSubscribe = a.timeStore.subscribe; const inventorySubscribe = a.inventoryStore.subscribe;
  a.timeStore.subscribe = listener => { timeSubscriptions++; const off = timeSubscribe(listener); return () => { timeSubscriptions--; off(); }; };
  a.inventoryStore.subscribe = listener => { inventorySubscriptions++; const off = inventorySubscribe(listener); return () => { inventorySubscriptions--; off(); }; };
  const weather = a.weatherStore.getState().rollForDay; a.weatherStore.setState({ rollForDay: (...args) => { counts.weather++; return weather(...args); } });
  const refresh = a.eventsStore.getState().refresh; a.eventsStore.setState({ refresh: (...args) => { counts.events++; return refresh(...args); } });
  const recheck = a.questStore.getState().recheck; a.questStore.setState({ recheck: (...args) => { counts.quests++; return recheck(...args); } });
  const tick = a.plotStore.getState().tick; a.plotStore.setState({ tick: (...args) => { counts.farming++; return tick(...args); } });
  const reset = () => { counts.weather = counts.events = counts.quests = counts.farming = 0; hits.fill(0); };
  function Consumer({ index }: { index: number }) { useWeatherTicker(); useEventsTicker(true, { onStarted: () => { hits[index]!++; }, onEnded: () => { hits[index]!++; } }); useQuestObjectiveTracker(); return null; }
  try {
    a.timeStore.getState().setTotalMinutes(0); b.timeStore.getState().setTotalMinutes(0);
    const firstDay = a.timeStore.getState().time;
    events.register({ id, name: id, triggers: [{ kind: 'monthDay', month: firstDay.month, day: firstDay.day }] });
    quests.register({ id, name: id, summary: '', objectives: [{ id: 'collect', type: 'collect', itemId: id, count: 20 }], rewards: [] });
    await a.setup(); await b.setup(); a.questStore.getState().start(id); b.questStore.getState().start(id);
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer index={0} /><Consumer index={1} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer index={0} /></GaesupRuntimeProvider></>));
    check(ctx, 'observer-time-subscriptions', timeSubscriptions, 3); check(ctx, 'observer-inventory-subscriptions', inventorySubscriptions, 1);
    a.inventoryStore.getState().add(id, 1); await a.save.save('main');
    reset(); a.timeStore.getState().setTotalMinutes(1440); a.inventoryStore.getState().add(id, 1);
    check(ctx, 'observer-daily-refreshes', counts.events, 1); check(ctx, 'observer-quest-rechecks', counts.quests, 1);
    check(ctx, 'observer-callback-delivery-misses', Number(hits[0] !== 1) + Number(hits[1] !== 1));
    reset(); await a.save.load('main');
    check(ctx, 'restore-observer-work', counts.weather + counts.events + counts.quests + counts.farming);
    check(ctx, 'restore-event-callbacks', hits[0]! + hits[1]!);
    check(ctx, 'restore-world-state-mismatches', Number(a.timeStore.getState().totalMinutes !== 0) + Number(a.inventoryStore.getState().countOf(id) !== 1));
    await a.dispose(); await nextFrame(ctx.signal); reset();
    check(ctx, 'observers-after-dispose', timeSubscriptions + inventorySubscriptions);
    a.timeStore.getState().setTotalMinutes(2880); a.inventoryStore.getState().add(id, 1);
    check(ctx, 'observer-work-after-dispose', counts.weather + counts.events + counts.quests + counts.farming);
    b.timeStore.getState().setTotalMinutes(1440); check(ctx, 'observer-other-world-loss', Number(b.eventsStore.getState().isActive(id)));
    await a.setup(); await nextFrame(ctx.signal); reset(); a.timeStore.getState().setTotalMinutes(4320); a.inventoryStore.getState().add(id, 1);
    check(ctx, 'observer-restart-mismatches', Number(counts.events !== 1) + Number(counts.quests !== 1));
  } finally {
    flushSync(() => root.unmount()); await a.save.remove('main'); await a.dispose(); await b.dispose();
    a.timeStore.subscribe = timeSubscribe; a.inventoryStore.subscribe = inventorySubscribe;
    events.clear(); events.registerAll(previousEvents); quests.clear(); quests.registerAll(previousQuests);
  }
}

async function restoreRaces(ctx: ScenarioContext) {
  let complete!: (value: SaveBlob | null) => void;
  const pending = new Promise<SaveBlob | null>(resolve => { complete = resolve; });
  const runtime = createGaesupRuntime({ plugins: [createTimePlugin()], saveOptions: { adapter: { read: () => pending, write: async () => {}, list: async () => [], remove: async () => {} } } });
  try {
    await runtime.setup(); runtime.timeStore.getState().setTotalMinutes(1440); const snapshot = runtime.save.createBlob();
    const oldLoad = runtime.save.load('main'); await runtime.dispose(); await runtime.setup(); runtime.timeStore.getState().setTotalMinutes(2880);
    complete(snapshot); const restored = await oldLoad;
    check(ctx, 'restore-past-world-writes', Number(runtime.timeStore.getState().totalMinutes !== 2880)); check(ctx, 'restore-past-world-accepted', Number(restored));
  } finally { complete(null); await runtime.dispose(); }

  let finish!: (value: SaveBlob) => void; let current = 1;
  const system = new SaveSystem({ adapter: { read: () => new Promise<SaveBlob>(resolve => { finish = resolve; }), write: async () => {}, list: async () => [], remove: async () => {} } });
  const off = system.register({ key: 'entity', serialize: () => current, hydrate: value => { current = Number(value); } });
  const oldRead = system.load(); off(); current = 2; const offNext = system.register({ key: 'entity', serialize: () => current, hydrate: value => { current = Number(value); } });
  finish({ version: 1, savedAt: 0, domains: { entity: 99 } }); const rebound = await oldRead;
  check(ctx, 'restore-replaced-domain-writes', Number(current !== 2) + Number(rebound)); offNext();

  const abort = new AbortController(); let first = 1; let second = 2;
  const aborted = new SaveSystem({ adapter: { read: async () => ({ version: 1, savedAt: 0, domains: { first: 10, second: 20 } }), write: async () => {}, list: async () => [], remove: async () => {} } });
  aborted.register({ key: 'first', serialize: () => first, hydrate: value => { first = Number(value); if (first === 10) abort.abort(); } });
  aborted.register({ key: 'second', serialize: () => second, hydrate: value => { second = Number(value); } });
  const applied = await aborted.load('main', abort.signal);
  check(ctx, 'restore-mid-apply-abort-mismatches', Number(applied) + Number(first !== 1) + Number(second !== 2));

  let releaseWrite!: () => void; const writeGate = new Promise<void>(resolve => { releaseWrite = resolve; });
  let stored: SaveBlob = { version: 1, savedAt: 0, domains: { value: 1 } }; let value = 10;
  const ordered = new SaveSystem({ adapter: { read: async () => stored, write: async (_slot, blob) => { await writeGate; stored = blob; }, list: async () => [], remove: async () => {} } });
  ordered.register({ key: 'value', serialize: () => value, hydrate: data => { value = Number(data); } });
  const saving = ordered.save(); const loading = ordered.load(); releaseWrite(); await saving; await loading;
  check(ctx, 'restore-overtook-pending-write', Number(value !== 10));
}

async function pausedTime(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime({ worldId: `paused-restore-${crypto.randomUUID()}`, plugins: [createTimePlugin()] });
  try {
    await runtime.setup(); runtime.timeStore.getState().setMode('realtime'); runtime.timeStore.getState().setTotalMinutes(1440); runtime.timeStore.getState().pause();
    await runtime.save.save('main'); runtime.timeStore.getState().resume(); runtime.timeStore.getState().setTotalMinutes(0); await runtime.save.load('main');
    check(ctx, 'restore-paused-clock-lost', Number(!runtime.timeStore.getState().paused));
    runtime.timeStore.getState().tick(1000); check(ctx, 'restore-paused-clock-advanced', Number(runtime.timeStore.getState().totalMinutes !== 1440));
    runtime.timeStore.getState().setTotalMinutes(0); runtime.timeStore.getState().pause();
    const off = runtime.save.register({ key: 'failure', serialize: () => 1, hydrate: value => { if (value === 2) throw new Error('Expected apply failure'); } });
    const snapshot = runtime.save.createBlob(); snapshot.domains['time'] = { ...runtime.timeStore.getState().serialize(), totalMinutes: 2880, pausedAt: null }; snapshot.domains['failure'] = 2;
    let rejected = false; try { runtime.save.hydrateBlob(snapshot); } catch { rejected = true; }
    check(ctx, 'rollback-paused-clock-mismatches', Number(!rejected) + Number(!runtime.timeStore.getState().paused) + Number(runtime.timeStore.getState().totalMinutes !== 0)); off();
  } finally { await runtime.save.remove('main'); await runtime.dispose(); }
}

export const restoreObserverScenarios: Scenario[] = [
  { id: 'world-restore-observers', title: '월드 구독·복원 부작용', description: '실제 날씨·달력·퀘스트 훅 두 개와 농사 clock, IndexedDB 복원·월드 종료/재시작을 검사합니다.', version: 1, run: observers },
  { id: 'world-restore-races', title: '저장 복원·월드 수명 경합', description: '실제 SaveSystem의 지연 읽기·월드/도메인 교체·적용 도중 취소·저장 직후 읽기를 제어된 adapter로 재현합니다.', version: 1, run: restoreRaces },
  { id: 'world-paused-time-restore', title: '일시 정지 clock 복원', description: '실제 IndexedDB 복원과 부분 적용 실패의 rollback에서 시간 일시 정지 상태가 유지되는지 검사합니다.', version: 1, run: pausedTime },
];
