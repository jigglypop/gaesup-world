import { GameplayEventEngine } from '../../gameplay/events/engine';
import { createDefaultGameplayEventRegistry } from '../../gameplay/events/registry';

test('a NaN gameplay flag is dropped instead of failing every later save', async () => {
  const engine = new GameplayEventEngine({
    registry: createDefaultGameplayEventRegistry(),
    blueprints: [{
      id: 'flags', name: 'flags', trigger: { type: 'manual', key: 'flags' }, policy: { run: 'once' },
      actions: [{ type: 'setFlag', key: 'broken', value: Number.NaN }, { type: 'setFlag', key: 'fine', value: 1 }],
    }],
  });
  await engine.dispatch({ type: 'manual', key: 'flags' });
  expect(engine.serialize().flags).toEqual({ fine: 1 });
});
