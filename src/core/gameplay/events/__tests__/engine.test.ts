import { GameplayEventEngine } from '../engine';
import { GameplayEventRegistry } from '../registry';
import type { GameplayEventBlueprint } from '../types';

describe('GameplayEventEngine', () => {
  it('runs matching blueprint actions when conditions pass', async () => {
    const registry = new GameplayEventRegistry();
    const calls: string[] = [];
    registry.registerCondition('always', () => true);
    registry.registerAction('setFlag', (action, context) => {
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
    expect(engine.state.flags.visitedMeadow).toBe(true);
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
