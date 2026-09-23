import { GameplayEventEngine } from '../engine';
import { commitGameplayEffect } from '../execution';
import { GameplayEventRegistry } from '../registry';
import type { GameplayEventBlueprint, GameplayEventContext } from '../types';

const blueprint = (id = 'run'): GameplayEventBlueprint => ({
  id, name: id, trigger: { type: 'manual', key: 'run' }, policy: { run: 'once' },
  actions: [{ type: 'custom', key: 'wait' }, { type: 'setFlag', key: 'following', value: true }],
});
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('cancellation settles callers without waiting for a custom promise and rejects its later effects', async () => {
  const registry = new GameplayEventRegistry();
  let reject!: (error: Error) => void; let context!: GameplayEventContext;
  registry.registerAction('custom', (_action, current) => { context = current; return new Promise<void>((_resolve, no) => { reject = no; }); });
  const following = jest.fn(); registry.registerAction('setFlag', following);
  const engine = new GameplayEventEngine({ registry, blueprints: [blueprint()] });
  let result: unknown; const pending = engine.dispatch({ type: 'manual', key: 'run' }).then(value => { result = value; });
  const flags = context.state.flags;
  engine.suspend(); await flush();
  expect(result).toEqual([{ blueprintId: 'run', actionCount: 1, skipped: 'cancelled' }]);
  engine.resume(); engine.state.flags['saved'] = true;
  context.state.flags['late'] = true; flags['retained'] = true; delete context.state.flags['saved'];
  Object.assign(context.state.flags, { assigned: true });
  expect(context.setFlag?.('late', true)).toBe(false);
  const effect = jest.fn(); expect(commitGameplayEffect(context, effect)).toBe(false); expect(effect).not.toHaveBeenCalled();
  reject(new Error('late rejection')); await pending; await flush();
  expect(engine.state.flags).toEqual({ saved: true }); expect(engine.state.executedAt).toEqual({});
  expect(following).not.toHaveBeenCalled();
});

test('completed contexts cannot change flags or execution history while fresh handlers still can', async () => {
  const registry = new GameplayEventRegistry(); let context!: GameplayEventContext;
  registry.registerAction('custom', (_action, current) => { context = current; current.state.flags['live'] = true; });
  const engine = new GameplayEventEngine({ registry, now: () => 42, blueprints: [blueprint()] });
  await engine.dispatch({ type: 'manual', key: 'run' });
  context.state.executedAt['run'] = 999; context.state.flags = { replaced: true };
  expect(commitGameplayEffect(context, () => { throw new Error('must not execute'); })).toBe(false);
  expect(engine.serialize()).toEqual({ version: 1, executedAt: { run: 42 }, flags: { live: true } });
});

test('invalid snapshot leaves pending work intact and prepared snapshots own their data', async () => {
  const registry = new GameplayEventRegistry(); let release!: () => void; let context!: GameplayEventContext;
  registry.registerAction('custom', (_action, current) => { context = current; return new Promise<void>(resolve => { release = resolve; }); });
  const engine = new GameplayEventEngine({ registry, now: () => 42, blueprints: [blueprint()] });
  const pending = engine.dispatch({ type: 'manual', key: 'run' });
  expect(() => engine.hydrate({ version: 1, executedAt: {}, flags: { broken: NaN } })).toThrow('Invalid gameplay');
  expect(context.signal?.aborted).toBe(false); release(); await pending;
  const data = { version: 1, executedAt: { saved: 20 }, flags: { saved: true } };
  const apply = engine.prepareHydrate(data); data.executedAt.saved = 99; data.flags.saved = false; apply();
  const snapshot = engine.serialize(); snapshot.executedAt['saved'] = 100; snapshot.flags['saved'] = false;
  expect(engine.serialize()).toEqual({ version: 1, executedAt: { saved: 20 }, flags: { saved: true } });
  engine.hydrate(undefined); expect(engine.serialize()).toEqual({ version: 1, executedAt: {}, flags: {} });
});

test('replacement cancels old work and a reused ID retains its new once lock', async () => {
  const registry = new GameplayEventRegistry(); const releases: (() => void)[] = [];
  registry.registerAction('custom', () => new Promise<void>(resolve => { releases.push(resolve); }));
  const engine = new GameplayEventEngine({ registry, blueprints: [blueprint()] });
  const old = engine.dispatch({ type: 'manual', key: 'run' }); engine.setBlueprints([blueprint()]);
  const fresh = engine.dispatch({ type: 'manual', key: 'run' }); await old; releases[0]!(); await flush();
  expect((await engine.dispatch({ type: 'manual', key: 'run' }))[0]?.skipped).toBe('in-flight');
  releases[1]!(); await fresh;
  expect((await engine.dispatch({ type: 'manual', key: 'run' }))[0]?.skipped).toBe('already-executed');
});

test('synchronous actions and matching blueprints finish before the next microtask', async () => {
  const registry = new GameplayEventRegistry(); const calls: string[] = [];
  registry.registerAction('custom', (_action, context) => { calls.push(context.blueprint.id); });
  const engine = new GameplayEventEngine({ registry, blueprints: [blueprint('first'), blueprint('second')] });
  queueMicrotask(() => { calls.push('microtask'); });
  await engine.dispatch({ type: 'manual', key: 'run' });
  expect(calls).toEqual(['first', 'second', 'microtask']);
});
