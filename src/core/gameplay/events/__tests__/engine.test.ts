import { GameplayEventEngine } from '../engine';
import { GameplayEventRegistry } from '../registry';
import type { GameplayEventAction, GameplayEventBlueprint } from '../types';

describe('GameplayEventEngine', () => {
  it('blocks overlapping once executions and keeps a new generation lock when an old condition settles', async () => {
    const registry = new GameplayEventRegistry();
    const release: ((value: boolean) => void)[] = [];
    registry.registerCondition('custom', () => new Promise<boolean>(resolve => release.push(resolve)));
    const action = jest.fn(); registry.registerAction('custom', action);
    const engine = new GameplayEventEngine({ registry, now: () => 42, blueprints: [{
      id: 'once', name: '', trigger: { type: 'manual', key: 'run' }, policy: { run: 'once' },
      conditions: [{ type: 'custom', key: 'wait' }], actions: [{ type: 'custom', key: 'apply' }],
    }] });
    const first = engine.dispatch({ type: 'manual', key: 'run' });
    expect(await engine.dispatch({ type: 'manual', key: 'run' })).toEqual([{ blueprintId: 'once', actionCount: 0, skipped: 'in-flight' }]);
    engine.suspend();
    expect(await engine.dispatch({ type: 'manual', key: 'run' })).toEqual([]);
    engine.resume();
    const second = engine.dispatch({ type: 'manual', key: 'run' });
    release[0]!(true);
    expect(await first).toEqual([{ blueprintId: 'once', actionCount: 0, skipped: 'cancelled' }]);
    expect(await engine.dispatch({ type: 'manual', key: 'run' })).toEqual([{ blueprintId: 'once', actionCount: 0, skipped: 'in-flight' }]);
    release[1]!(true); await second;
    expect(action).toHaveBeenCalledTimes(1);
    expect(engine.state.executedAt['once']).toBe(42);
  });

  it('signals a running handler and cancels remaining actions on suspension', async () => {
    const registry = new GameplayEventRegistry();
    let release!: () => void; let signal: AbortSignal | undefined;
    registry.registerAction('custom', (_action, context) => { signal = context.signal; return new Promise<void>(resolve => { release = resolve; }); });
    const remaining = jest.fn(); registry.registerAction('giveItem', remaining);
    const engine = new GameplayEventEngine({ registry, blueprints: [{ id: 'cancel', name: '', trigger: { type: 'manual', key: 'run' }, actions: [
      { type: 'custom', key: 'wait' }, { type: 'giveItem', itemId: 'item' },
    ] }] });
    const pending = engine.dispatch({ type: 'manual', key: 'run' });
    engine.suspend(); expect(signal?.aborted).toBe(true); release();
    expect(await pending).toEqual([{ blueprintId: 'cancel', actionCount: 1, skipped: 'cancelled' }]);
    expect(remaining).not.toHaveBeenCalled(); expect(engine.state.executedAt['cancel']).toBeUndefined();
  });

  it.each(['condition', 'action'])('releases the once guard when a %s rejects', async phase => {
    const registry = new GameplayEventRegistry(); let fail = true;
    registry.registerCondition('custom', () => { if (phase === 'condition' && fail) throw new Error('handler failure'); return true; });
    registry.registerAction('custom', () => { if (phase === 'action' && fail) throw new Error('handler failure'); });
    const engine = new GameplayEventEngine({ registry, blueprints: [{ id: 'retry', name: '', trigger: { type: 'manual', key: 'run' }, policy: { run: 'once' },
      conditions: [{ type: 'custom', key: 'condition' }], actions: [{ type: 'custom', key: 'action' }],
    }] });
    await expect(engine.dispatch({ type: 'manual', key: 'run' })).rejects.toThrow('handler failure');
    expect(engine.state.executedAt['retry']).toBeUndefined(); fail = false;
    expect(await engine.dispatch({ type: 'manual', key: 'run' })).toEqual([{ blueprintId: 'retry', actionCount: 1 }]);
  });

  it('runs matching blueprint actions when conditions pass', async () => {
    const registry = new GameplayEventRegistry();
    const calls: string[] = [];
    registry.registerCondition('always', () => true);
    registry.registerAction<Extract<GameplayEventAction, { type: 'setFlag' }>>('setFlag', (action, context) => {
      context.state.flags[action.key] = action.value;
      calls.push(action.key);
    });
    const blueprints: GameplayEventBlueprint[] = [
      {
        id: 'enter-meadow',
        name: 'Enter Meadow',
        trigger: { type: 'enterArea', areaId: 'meadow' },
        conditions: [{ type: 'always' }],
        actions: [{ type: 'setFlag', key: 'visitedMeadow', value: true }],
      },
    ];

    const engine = new GameplayEventEngine({ blueprints, registry });
    const result = await engine.dispatch({ type: 'enterArea', areaId: 'meadow' });

    expect(result).toEqual([{ blueprintId: 'enter-meadow', actionCount: 1 }]);
    expect(engine.state.flags['visitedMeadow']).toBe(true);
    expect(calls).toEqual(['visitedMeadow']);
  });

  it('skips once policies after the first execution', async () => {
    const registry = new GameplayEventRegistry();
    registry.registerAction('custom', () => undefined);
    const engine = new GameplayEventEngine({
      registry,
      blueprints: [
        {
          id: 'once',
          name: 'Once',
          trigger: { type: 'manual', key: 'run' },
          actions: [{ type: 'custom', key: 'noop' }],
          policy: { run: 'once' },
        },
      ],
    });

    await engine.dispatch({ type: 'manual', key: 'run' });
    const second = await engine.dispatch({ type: 'manual', key: 'run' });

    expect(second).toEqual([{ blueprintId: 'once', actionCount: 0, skipped: 'already-executed' }]);
  });

  it('skips actions when a condition fails', async () => {
    const registry = new GameplayEventRegistry();
    registry.registerCondition('custom', () => false);
    registry.registerAction('custom', () => {
      throw new Error('should not run');
    });
    const engine = new GameplayEventEngine({
      registry,
      blueprints: [
        {
          id: 'blocked',
          name: 'Blocked',
          trigger: { type: 'manual', key: 'run' },
          conditions: [{ type: 'custom', key: 'blocked' }],
          actions: [{ type: 'custom', key: 'noop' }],
        },
      ],
    });

    const result = await engine.dispatch({ type: 'manual', key: 'run' });

    expect(result).toEqual([{ blueprintId: 'blocked', actionCount: 0, skipped: 'condition:custom' }]);
  });
});

test('the save revision follows the flag and execution maps, including direct writes', () => {
  const engine = new GameplayEventEngine({ registry: new GameplayEventRegistry() });
  const initial = engine.revision();
  expect(engine.revision()).toBe(initial);
  engine.state.flags['door'] = 'open';
  const opened = engine.revision();
  expect(opened).not.toBe(initial);
  engine.state.flags['door'] = 'closed';
  expect(engine.revision()).not.toBe(opened);
  engine.hydrate({ version: 1, executedAt: {}, flags: {} });
  expect(engine.revision()).toBe(initial);
});
