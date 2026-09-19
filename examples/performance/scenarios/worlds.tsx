import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, createTimePlugin, GaesupRuntimeProvider, SaveSystem, useGameClock, useTimeOfDay, type SaveBlob, type TimeSerialized } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

function memorySave() {
  const slots = new Map<string, SaveBlob>();
  return new SaveSystem({ adapter: {
    read: async key => slots.get(key) ?? null,
    write: async (key, blob) => { slots.set(key, structuredClone(blob)); },
    list: async () => [...slots.keys()], remove: async key => { slots.delete(key); },
  } });
}

async function worldIsolation(ctx: ScenarioContext) {
  const a = createGaesupRuntime({ saveSystem: memorySave(), plugins: [createTimePlugin()] });
  const b = createGaesupRuntime({ saveSystem: memorySave(), plugins: [createTimePlugin()] });
  const defaultA = createGaesupRuntime(); const defaultB = createGaesupRuntime();
  const viewed: Record<string, string> = {};
  function Time({ id }: { id: string }) { const value = useTimeOfDay(); viewed[id] = `${value.hour}:${value.minute}`; return <p>월드 {id}: {viewed[id]}</p>; }
  type TimeService = { getState: () => { setTotalMinutes: (minutes: number) => void; serialize: () => TimeSerialized } };
  const root = createRoot(ctx.host);
  let previousA: TimeSerialized | undefined; let previousB: TimeSerialized | undefined;
  try {
    await a.setup(); await b.setup();
    const timeA = a.requireService<TimeService>('time.store');
    const timeB = b.requireService<TimeService>('time.store');
    previousA = timeA.getState().serialize(); previousB = timeB.getState().serialize();
    timeA.getState().setTotalMinutes(480); timeB.getState().setTotalMinutes(480);
    timeA.getState().setTotalMinutes(610);
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Time id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Time id="B" /></GaesupRuntimeProvider></>));
    for (let i = 0; i < 4; i++) await nextFrame(ctx.signal);
    ctx.assert('A-own-time', '10:10', viewed['A'] ?? 'missing');
    ctx.assert('B-isolated-time', '8:0', viewed['B'] ?? 'missing');
    ctx.assert('default-save-owners-distinct', true, defaultA.save !== defaultB.save);
    ctx.sample('time-leaked-domains', Number(timeB.getState().serialize().totalMinutes !== 480), 'count', 'two-runtime-services');
    ctx.sample('shared-default-save', Number(defaultA.save === defaultB.save), 'count', 'two-runtime-defaults');
    await a.dispose();
    timeB.getState().setTotalMinutes(720);
    for (let i = 0; i < 3; i++) await nextFrame(ctx.signal);
    ctx.assert('B-after-A-dispose', '12:0', viewed['B'] ?? 'missing');
  } finally {
    flushSync(() => root.unmount());
    // Keep the legacy fallback store intact on the failing baseline too.
    const restore = (runtime: typeof a, value: TimeSerialized | undefined) => {
      const service = runtime.getService<{ getState: () => { hydrate: (data: TimeSerialized) => void } }>('time.store');
      if (service && value) service.getState().hydrate(value);
    };
    restore(a, previousA); restore(b, previousB);
    await a.dispose(); await b.dispose(); await defaultA.dispose(); await defaultB.dispose();
  }
}

export const worldScenarios: Scenario[] = [
  { id: 'world-isolation', title: '두 월드의 시간·저장 소유권', description: '별도 runtime과 실제 Provider/시간 훅을 연결해 상태 오염과 개별 종료를 검사합니다.', version: 1, requirementIds: ['R25'], run: worldIsolation },
  { id: 'world-storage', title: '두 월드의 실제 저장·재생성', description: '기본 IndexedDB adapter로 같은 슬롯에 서로 다른 시간을 저장하고, runtime 재생성·삭제 후 격리를 확인합니다.', version: 1, requirementIds: ['R25'], run: worldStorage },
  { id: 'clock-lifecycle', title: 'runtime clock 50회 재시작', description: '실제 Provider와 소비자 2개를 유지한 채 setup/dispose를 50회 반복하고 RAF 잔여·다른 월드의 진행을 검사합니다.', version: 1, requirementIds: ['R25', 'R26'], run: clockLifecycle },
];

async function worldStorage(ctx: ScenarioContext) {
  if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is required for this scenario');
  const identity = `performance-${crypto.randomUUID()}`;
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, plugins: [createTimePlugin()] });
  let a = make('a'); const b = make('a:b');
  try {
    await a.setup(); await b.setup();
    a.timeStore.getState().setTotalMinutes(610); b.timeStore.getState().setTotalMinutes(920);
    await Promise.all([a.save.save('main'), b.save.save('main')]);
    await a.save.save('only-a');
    ctx.assert('A-slots', 'main,only-a', (await a.save.list()).sort().join(','));
    ctx.assert('B-slots', 'main', (await b.save.list()).join(','));
    await a.dispose(); a = make('a'); await a.setup();
    ctx.assert('A-load-after-recreation', true, await a.save.load('main'));
    ctx.assert('A-persisted-time', 610, a.timeStore.getState().totalMinutes);
    b.timeStore.getState().setTotalMinutes(0);
    await b.save.load('main');
    ctx.assert('B-persisted-time', 920, b.timeStore.getState().totalMinutes);
    await a.save.remove('main');
    ctx.assert('B-survives-A-remove', true, await b.save.load('main'));
    ctx.assert('A-own-slot-removed', false, await a.save.load('main'));
    const errors = Number(a.timeStore.getState().totalMinutes !== 610) + Number(b.timeStore.getState().totalMinutes !== 920);
    ctx.sample('save-state-mismatches', errors, 'count', 'native-indexeddb-same-slot');
    ctx.host.textContent = `IndexedDB: A=${a.timeStore.getState().totalMinutes}, B=${b.timeStore.getState().totalMinutes}, 저장 오염=${errors}`;
  } finally {
    await Promise.all([a.save.remove('main'), a.save.remove('only-a'), b.save.remove('main')]);
    const remaining = (await a.save.list()).length + (await b.save.list()).length;
    ctx.assert('scenario-slots-after-cleanup', 0, remaining);
    ctx.sample('scenario-slots-after-cleanup', remaining, 'count', 'native-indexeddb');
    await a.dispose(); await b.dispose();
  }
}

async function clockLifecycle(ctx: ScenarioContext) {
  const request = window.requestAnimationFrame; const cancel = window.cancelAnimationFrame;
  const pending = new Map<number, FrameRequestCallback>(); let nextId = 0;
  window.requestAnimationFrame = callback => { pending.set(++nextId, callback); return nextId; };
  window.cancelAnimationFrame = id => { pending.delete(id); };
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const root = createRoot(ctx.host);
  function Consumer() { useGameClock(); return null; }
  let timestamp = 0; let failures = 0;
  const check = (id: string, expected: number, actual: number) => { ctx.assert(id, expected, actual); failures += Number(expected !== actual); };
  const frame = () => {
    const callbacks = [...pending.values()]; pending.clear(); timestamp += 1000 / 60;
    callbacks.forEach(callback => callback(timestamp));
  };
  try {
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer /><Consumer /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer /></GaesupRuntimeProvider></>));
    check('inactive-runtimes-have-no-RAF', 0, pending.size);
    await b.setup();
    for (let i = 0; i < 50; i++) {
      if (ctx.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      await a.setup(); check(`cycle-${i}/two-world-owners`, 2, pending.size);
      const before = a.clockLoop.clock.tick; frame(); frame();
      check(`cycle-${i}/one-tick-after-resume`, before + 1, a.clockLoop.clock.tick);
      await a.dispose(); check(`cycle-${i}/B-owner-remains`, 1, pending.size);
      const bBefore = b.clockLoop.clock.tick; frame();
      check(`cycle-${i}/A-stays-stopped`, before + 1, a.clockLoop.clock.tick);
      check(`cycle-${i}/B-keeps-running`, bBefore + 1, b.clockLoop.clock.tick);
    }
    ctx.sample('lifecycle-mismatches', failures, 'count', '50-runtime-restarts-mounted-consumers');
    ctx.sample('completed-restarts', 50, 'count', 'runtime-setup-dispose');
  } finally {
    flushSync(() => root.unmount());
    await a.dispose(); await b.dispose();
    check('pending-after-unmount', 0, pending.size);
    ctx.sample('pending-after-unmount', pending.size, 'count', 'two-runtime-three-consumer-cleanup');
    window.requestAnimationFrame = request; window.cancelAnimationFrame = cancel;
  }
  ctx.host.textContent = `50회 재시작: 불일치 ${failures}, 남은 RAF ${pending.size}`;
}
