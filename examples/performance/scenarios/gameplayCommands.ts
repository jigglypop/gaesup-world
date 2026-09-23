import { createGaesupRuntime, createInventoryPlugin } from 'gaesup-world';
import { GameplayEventEngine, type GameplayEventBlueprint } from 'gaesup-world/gameplay';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

const check = (ctx: ScenarioContext, id: string, actual: number) => { ctx.sample(id, actual, 'count', 'actual-gameplay-engine-and-save'); ctx.assert(id, 0, actual); };
const blueprint = (id: string, actions: GameplayEventBlueprint['actions']): GameplayEventBlueprint => ({ id, name: id, trigger: { type: 'manual', key: id }, actions, policy: { run: 'once' } });

async function restoration(ctx: ScenarioContext) {
  const identity = `gameplay-restore-${crypto.randomUUID()}`;
  const make = (suffix: string) => createGaesupRuntime({ worldId: `${identity}:${suffix}`, plugins: [createInventoryPlugin()] });
  const a = make('a'); const b = make('b'); let release = () => {}; let off = () => {};
  try {
    await a.setup(); await b.setup();
    const gate = new Promise<void>(resolve => { release = resolve; });
    a.gameplayEventRegistry.registerAction('custom', async (_action, context) => { await gate; context.state.flags['stale'] = true; });
    a.gameplayEvents.setBlueprints([
      blueprint('waiting', [{ type: 'custom', key: 'wait' }, { type: 'giveItem', itemId: 'stale' }, { type: 'setFlag', key: 'following', value: true }]),
      blueprint('reentrant', [{ type: 'giveItem', itemId: 'reentrant' }]),
      blueprint('once', [{ type: 'giveItem', itemId: 'once' }]),
    ]);
    b.gameplayEvents.setBlueprints([blueprint('waiting', [{ type: 'giveItem', itemId: 'other' }])]);
    a.gameplayEvents.state.flags['checkpoint'] = 'saved'; await a.save.save('main');
    a.gameplayEvents.state.flags['checkpoint'] = 'changed';
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' });
    let settled = false; const pending = a.gameplayEvents.dispatch({ type: 'manual', key: 'waiting' }).then(value => { settled = true; return value; });
    await b.gameplayEvents.dispatch({ type: 'manual', key: 'waiting' });
    let reentrant = false;
    off = a.inventoryStore.subscribe(() => { if (a.save.isRestoring() && !reentrant) { reentrant = true; void a.gameplayEvents.dispatch({ type: 'manual', key: 'reentrant' }); } });
    await a.save.load('main'); await nextFrame(ctx.signal);
    check(ctx, 'gameplay-restore-unsettled-callers', Number(!settled));
    release(); const result = await pending;
    check(ctx, 'gameplay-restore-late-rewards', a.inventoryStore.getState().countOf('stale'));
    check(ctx, 'gameplay-restore-late-flags', Number(a.gameplayEvents.state.flags['stale'] !== undefined) + Number(a.gameplayEvents.state.flags['following'] !== undefined));
    check(ctx, 'gameplay-restore-cancellation-misses', Number(result[0]?.skipped !== 'cancelled'));
    check(ctx, 'gameplay-restore-reentrant-rewards', a.inventoryStore.getState().countOf('reentrant'));
    check(ctx, 'gameplay-restore-state-mismatches', Number(a.gameplayEvents.state.flags['checkpoint'] !== 'saved') + Number(a.gameplayEvents.state.executedAt['once'] !== undefined));
    check(ctx, 'gameplay-restore-other-world-changes', Number(b.inventoryStore.getState().countOf('other') !== 1) + Number(b.gameplayEvents.state.executedAt['waiting'] === undefined));
    off(); off = () => {};
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' }); await a.save.save('main');
    await a.dispose(); await a.setup(); await a.save.load('main');
    const repeated = await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' });
    check(ctx, 'gameplay-restored-once-policy-mismatches', Number(repeated[0]?.skipped !== 'already-executed') + Number(a.inventoryStore.getState().countOf('once') !== 1));
  } finally { release(); off(); await a.save.remove('main'); await a.dispose(); await b.dispose(); }
}

async function scheduling(ctx: ScenarioContext) {
  const engine = new GameplayEventEngine({ blueprints: [{ ...blueprint('sync', [{ type: 'setFlag', key: 'first', value: true }, { type: 'setFlag', key: 'last', value: true }]), policy: { run: 'repeat' } }] });
  let completedInSameTurn = false;
  queueMicrotask(() => { completedInSameTurn = engine.state.flags['last'] === true; });
  await engine.dispatch({ type: 'manual', key: 'sync' });
  check(ctx, 'gameplay-sync-intermediate-microtasks', Number(!completedInSameTurn));
}

async function throughput(ctx: ScenarioContext) {
  const engine = new GameplayEventEngine({ blueprints: [{ ...blueprint('batch', Array.from({ length: 8 }, (_, i) => ({ type: 'setFlag', key: `flag-${i}`, value: i }))), policy: { run: 'repeat' } }] });
  const batch = async () => { const start = performance.now(); for (let i = 0; i < ctx.config.count; i++) await engine.dispatch({ type: 'manual', key: 'batch' }); return performance.now() - start; };
  const warmup = performance.now() + ctx.config.warmupMs;
  while (performance.now() < warmup) { await batch(); await nextFrame(ctx.signal); }
  const deadline = performance.now() + ctx.config.durationMs;
  do { ctx.sample('gameplay-dispatch-batch', await batch(), 'ms', 'cpu-complete-batch-eight-actions-per-command'); await nextFrame(ctx.signal); } while (performance.now() < deadline);
  ctx.sample('gameplay-command-count', ctx.config.count, 'count', 'commands-per-batch');
  ctx.assert('gameplay-final-flag', 7, engine.state.flags['flag-7'] ?? -1);
}

export const gameplayCommandScenarios: Scenario[] = [
  { id: 'world-gameplay-restore', title: '복원 중 비동기 gameplay 명령', description: '실제 두 월드·IndexedDB·지연 action·취소 대기자·상태 플래그·보상·일회성 이력을 검사합니다.', version: 1, requirementIds: ['R02', 'R25', 'R30'], run: restoration },
  { id: 'gameplay-command-order', title: '동기 gameplay 명령 순서', description: '동기 action 사이에 불필요한 microtask가 끼어 중간 상태를 노출하는지 검사합니다.', version: 1, requirementIds: ['R25', 'R30'], run: scheduling },
  { id: 'gameplay-dispatch', title: 'gameplay 명령 처리 비용', description: '명령당 8개 실제 플래그 action을 수행한 전체 batch의 CPU 시간을 측정합니다. 객체 수는 batch당 명령 수입니다.', version: 1, requirementIds: ['R25', 'R26'], timed: true, run: throughput },
];
