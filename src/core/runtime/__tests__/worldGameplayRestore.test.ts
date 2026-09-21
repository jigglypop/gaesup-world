import { createGaesupRuntime } from '../createGaesupRuntime';
import { createInventoryPlugin } from '../../inventory/plugin';
import { commitGameplayEffect } from '../../gameplay/events/execution';
import type { GameplayEventBlueprint } from '../../gameplay/events/types';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
const blueprint = (id: string, actions: GameplayEventBlueprint['actions']): GameplayEventBlueprint => ({
  id, name: id, trigger: { type: 'manual', key: id }, policy: { run: 'once' }, actions,
});

test('restore cancels delayed rewards and subscriber reentry, preserves another world and restores once history', async () => {
  const a = createGaesupRuntime({ plugins: [createInventoryPlugin()] });
  const b = createGaesupRuntime({ plugins: [createInventoryPlugin()] });
  let release!: () => void; let off = () => {};
  try {
    await a.setup(); await b.setup();
    const gate = new Promise<void>(resolve => { release = resolve; });
    a.gameplayEventRegistry.registerAction('custom', async (_action, context) => {
      await gate; context.state.flags['late'] = true;
      commitGameplayEffect(context, () => { a.inventoryStore.getState().add('late', 1); });
    });
    a.gameplayEvents.setBlueprints([
      blueprint('waiting', [{ type: 'custom', key: 'wait' }, { type: 'giveItem', itemId: 'following' }]),
      blueprint('reentrant', [{ type: 'giveItem', itemId: 'reentrant' }]),
      blueprint('once', [{ type: 'giveItem', itemId: 'once' }]),
    ]);
    b.gameplayEvents.setBlueprints([blueprint('other', [{ type: 'giveItem', itemId: 'other' }])]);
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' });
    const saved = a.save.createBlob();
    const pending = a.gameplayEvents.dispatch({ type: 'manual', key: 'waiting' });
    let reentries = 0;
    off = a.inventoryStore.subscribe(() => { if (a.save.isRestoring()) { reentries++; void a.gameplayEvents.dispatch({ type: 'manual', key: 'reentrant' }); } });
    expect(a.save.hydrateBlob(saved)).toBe(true);
    expect((await pending)[0]?.skipped).toBe('cancelled'); release(); await Promise.resolve();
    expect(reentries).toBeGreaterThan(0);
    for (const item of ['late', 'following', 'reentrant']) expect(a.inventoryStore.getState().countOf(item)).toBe(0);
    expect(a.gameplayEvents.state.flags['late']).toBeUndefined();
    expect((await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' }))[0]?.skipped).toBe('already-executed');
    await b.gameplayEvents.dispatch({ type: 'manual', key: 'other' }); expect(b.inventoryStore.getState().countOf('other')).toBe(1);
    off(); off = () => {}; await a.dispose(); await a.setup(); a.save.hydrateBlob(saved);
    expect((await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' }))[0]?.skipped).toBe('already-executed');
    expect(a.inventoryStore.getState().countOf('once')).toBe(1);
  } finally { release?.(); off(); await a.dispose(); await b.dispose(); }
});

test('failed hydration rolls gameplay state back and re-enables fresh dispatch after cancelling old work', async () => {
  const runtime = createGaesupRuntime(); let release!: () => void; let off = () => {};
  try {
    await runtime.setup();
    runtime.gameplayEventRegistry.registerAction('custom', () => new Promise<void>(resolve => { release = resolve; }));
    runtime.gameplayEvents.setBlueprints([blueprint('waiting', [{ type: 'custom', key: 'wait' }]), blueprint('fresh', [{ type: 'setFlag', key: 'fresh', value: true }])]);
    runtime.gameplayEvents.state.flags['current'] = true;
    off = runtime.save.register({ key: 'failure', serialize: () => false, hydrate: value => { if (value) throw new Error('apply failed'); } });
    const saved = runtime.save.createBlob(); saved.domains['gameplay-events'] = { version: 1, executedAt: {}, flags: { saved: true } }; saved.domains['failure'] = true;
    const pending = runtime.gameplayEvents.dispatch({ type: 'manual', key: 'waiting' });
    expect(() => runtime.save.hydrateBlob(saved)).toThrow('previous state restored');
    expect((await pending)[0]?.skipped).toBe('cancelled'); release();
    expect(runtime.gameplayEvents.state.flags).toEqual({ current: true });
    expect((await runtime.gameplayEvents.dispatch({ type: 'manual', key: 'fresh' }))[0]?.actionCount).toBe(1);
    expect(runtime.gameplayEvents.state.flags['fresh']).toBe(true);
  } finally { release?.(); off(); await runtime.dispose(); }
});
