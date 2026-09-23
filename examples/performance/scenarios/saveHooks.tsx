import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, GaesupRuntimeProvider, SaveSystem, getSaveSystem, useAutoSave, useLoadOnMount, type SaveBlob } from 'gaesup-world';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

const check = (ctx: ScenarioContext, id: string, actual: number, expected = 0) => { ctx.sample(id, actual, 'count', 'real-save-system-and-react-hooks'); ctx.assert(id, expected, actual); };
const data = (counter: number): SaveBlob => ({ version: 1, savedAt: 0, domains: { counter } });
const settle = async (ctx: ScenarioContext) => { await nextFrame(ctx.signal); await nextFrame(ctx.signal); };

async function worldHooks(ctx: ScenarioContext) {
  const slot = `save-hooks-${crypto.randomUUID()}`; const root = createRoot(ctx.host); let callbacks = 0; let globalWrites = 0; let unloadListeners = 0;
  const global = getSaveSystem(); const globalSave = global.save; global.save = async (...args) => { globalWrites++; return globalSave.apply(global, args); };
  const add = window.addEventListener; const remove = window.removeEventListener;
  window.addEventListener = ((type: string, ...args: unknown[]) => { if (type === 'beforeunload') unloadListeners++; return Reflect.apply(add, window, [type, ...args]); }) as typeof add;
  window.removeEventListener = ((type: string, ...args: unknown[]) => { if (type === 'beforeunload') unloadListeners--; return Reflect.apply(remove, window, [type, ...args]); }) as typeof remove;
  const make = (saved: number) => {
    const state = { value: 0, reads: 0, writes: 0, saved: data(saved) };
    const runtime = createGaesupRuntime({ saveOptions: { adapter: { read: async () => { state.reads++; return state.saved; }, write: async (_slot, blob) => { state.writes++; state.saved = blob; }, list: async () => [], remove: async () => {} } }, saveBindings: [{ key: 'counter', serialize: () => state.value, hydrate: value => { state.value = Number(value); } }] });
    return { state, runtime };
  };
  const a = make(11); const b = make(22);
  function Consumer() { useLoadOnMount(slot, () => { callbacks++; }); useAutoSave({ slot, intervalMs: 3600000, saveOnVisibilityChange: false }); return null; }
  try {
    await a.runtime.setup(); await b.runtime.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a.runtime}><Consumer /><Consumer /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b.runtime}><Consumer /></GaesupRuntimeProvider></>));
    for (let i = 0; i < 30 && callbacks < 3; i++) await nextFrame(ctx.signal);
    check(ctx, 'save-hook-world-load-mismatches', Number(a.state.value !== 11) + Number(b.state.value !== 22));
    check(ctx, 'save-hook-world-read-misses', Number(a.state.reads !== 1) + Number(b.state.reads !== 1));
    check(ctx, 'save-hook-unload-listeners', unloadListeners, 2);
    a.state.value = 33; b.state.value = 44; window.dispatchEvent(new Event('beforeunload')); await settle(ctx);
    check(ctx, 'save-hook-global-writes', globalWrites); check(ctx, 'save-hook-world-write-misses', Number(a.state.writes !== 1) + Number(b.state.writes !== 1));
    await a.runtime.dispose(); await settle(ctx); check(ctx, 'save-hook-listeners-after-world-dispose', unloadListeners, 1);
    const writes = b.state.writes; window.dispatchEvent(new Event('beforeunload')); await settle(ctx); check(ctx, 'save-hook-other-world-loss', Number(b.state.writes !== writes + 1));
    a.state.value = 99; await a.runtime.setup(); await settle(ctx);
    check(ctx, 'save-hook-world-restart-mismatches', Number(a.state.value !== 33) + Number(a.state.reads !== 2) + Number(b.state.reads !== 1));
  } finally {
    flushSync(() => root.unmount()); await a.runtime.dispose(); await b.runtime.dispose(); await global.remove(slot);
    global.save = globalSave; window.addEventListener = add; window.removeEventListener = remove;
  }
}

async function sharing(ctx: ScenarioContext) {
  const root = createRoot(ctx.host); const slot = 'owned'; let value = 1; let stored = data(7); let reads = 0; let writes = 0; let snapshots = 0; let callbacks = 0;
  let releaseRead!: () => void; const readGate = new Promise<void>(resolve => { releaseRead = resolve; });
  let releaseWrite = () => {}; let writeGate: Promise<void> | undefined; const written: number[] = [];
  const system = new SaveSystem({ defaultSlot: slot, adapter: { read: async () => { reads++; await readGate; return stored; }, write: async (_slot, blob) => { writes++; if (writeGate) await writeGate; stored = blob; written.push(Number(blob.domains['counter'])); }, list: async () => [], remove: async () => {} } });
  system.register({ key: 'counter', serialize: () => { snapshots++; return value; }, hydrate: data => { value = Number(data); } });
  function Consumer({ implicit = false, autosave = true }: { implicit?: boolean; autosave?: boolean }) {
    useLoadOnMount(implicit ? undefined : slot, () => { callbacks++; }, system);
    useAutoSave({ enabled: autosave, saveSystem: system, ...(implicit ? {} : { slot }), intervalMs: 3600000, saveOnVisibilityChange: false }); return null;
  }
  try {
    flushSync(() => root.render(<><Consumer implicit /><Consumer /></>)); await settle(ctx);
    check(ctx, 'save-hook-shared-initial-reads', reads, 1);
    window.dispatchEvent(new Event('beforeunload')); await settle(ctx); check(ctx, 'save-hook-writes-during-initial-load', writes);
    releaseRead(); await settle(ctx); check(ctx, 'save-hook-initial-data-loss', Number(value !== 7)); check(ctx, 'save-hook-initial-callback-misses', Math.abs(callbacks - 2));
    value = 42; flushSync(() => root.render(<><Consumer implicit /><Consumer /><Consumer autosave={false} /></>)); await settle(ctx);
    check(ctx, 'save-hook-late-consumer-reloads', Math.max(0, reads - 1)); check(ctx, 'save-hook-late-consumer-edit-loss', Number(value !== 42));
    writes = 0; snapshots = 0; written.length = 0; writeGate = new Promise<void>(resolve => { releaseWrite = resolve; }); value = 8;
    for (let i = 0; i < 3; i++) window.dispatchEvent(new Event('beforeunload'));
    value = 9; for (let i = 0; i < 3; i++) window.dispatchEvent(new Event('beforeunload'));
    releaseWrite(); await settle(ctx);
    check(ctx, 'save-hook-burst-writes', writes, 2); check(ctx, 'save-hook-burst-snapshots', snapshots, 2); check(ctx, 'save-hook-latest-snapshot-loss', Number(written.at(-1) !== 9));
    flushSync(() => root.unmount());
  } finally { releaseRead(); releaseWrite(); flushSync(() => root.unmount()); }

  const failureRoot = createRoot(ctx.host); let writesAfterFailure = 0;
  const broken = new SaveSystem({ adapter: { read: async () => { throw new Error('Expected initial read failure'); }, write: async () => { writesAfterFailure++; }, list: async () => [], remove: async () => {} } });
  function FailingConsumer() { useLoadOnMount(undefined, undefined, broken); useAutoSave({ saveSystem: broken, intervalMs: 3600000, saveOnVisibilityChange: false }); return null; }
  try { flushSync(() => failureRoot.render(<><FailingConsumer /><FailingConsumer /></>)); await settle(ctx); window.dispatchEvent(new Event('beforeunload')); await settle(ctx); check(ctx, 'save-hook-writes-after-load-failure', writesAfterFailure); }
  finally { flushSync(() => failureRoot.unmount()); }
}

export const saveHookScenarios: Scenario[] = [
  { id: 'world-save-hooks', title: '월드별 자동 저장·초기 로드', description: '실제 Provider의 기본 저장소 선택, 중복 훅, 종료/재시작과 다른 월드 보존을 측정합니다.', version: 1, requirementIds: ['R02', 'R25'], run: worldHooks },
  { id: 'save-hook-sharing', title: '저장 훅 공유·느린 I/O', description: '실제 SaveSystem에서 초기 읽기 중 저장, 늦게 추가한 소비자, 이벤트 폭주·최신 snapshot·읽기 실패를 제어된 adapter로 검사합니다.', version: 1, requirementIds: ['R02', 'R25'], run: sharing },
];
