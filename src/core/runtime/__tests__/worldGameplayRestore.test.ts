import { commitGameplayEffect } from '../../gameplay/events/execution';
import type { GameplayEventAction, GameplayEventBlueprint } from '../../gameplay/events/types';
import { createGaesupRuntime } from '../createGaesupRuntime';
import type { GaesupRuntime } from '../types';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
const blueprint = (id: string, actions: GameplayEventBlueprint['actions']): GameplayEventBlueprint => ({
  id, name: id, trigger: { type: 'manual', key: id }, policy: { run: 'once' }, actions,
});
const give = (item: string): GameplayEventAction => ({ type: 'custom', key: 'give', payload: { item } });

/** A saved domain gameplay actions write to: counts per item, with change listeners like a store. */
function counterDomain(runtime: GaesupRuntime, wait?: Promise<void>) {
  let counts: Record<string, number> = {};
  const listeners = new Set<() => void>();
  runtime.save.register({
    key: 'counter', serialize: () => ({ ...counts }),
    hydrate: (value) => { counts = { ...(value as Record<string, number>) }; for (const listener of listeners) listener(); },
  });
  runtime.gameplayEventRegistry.registerAction<Extract<GameplayEventAction, { type: 'custom' }>>('custom', async (action, context) => {
    if (action.key === 'wait') { await wait; context.state.flags['late'] = true; }
    const item = String((action.payload as { item?: string } | undefined)?.item ?? 'late');
    commitGameplayEffect(context, () => { counts = { ...counts, [item]: (counts[item] ?? 0) + 1 }; for (const listener of listeners) listener(); });
  });
  return {
    count: (item: string) => counts[item] ?? 0,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}

test('restore cancels delayed effects and subscriber reentry, preserves another world and restores once history', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  let release!: () => void; let off = () => {};
  try {
    await a.setup(); await b.setup();
    const gate = new Promise<void>(resolve => { release = resolve; });
    const counterA = counterDomain(a, gate); const counterB = counterDomain(b);
    a.gameplayEvents.setBlueprints([
      blueprint('waiting', [{ type: 'custom', key: 'wait' }, give('following')]),
      blueprint('reentrant', [give('reentrant')]),
      blueprint('once', [give('once')]),
    ]);
    b.gameplayEvents.setBlueprints([blueprint('other', [give('other')])]);
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' });
    const saved = a.save.createBlob();
    const pending = a.gameplayEvents.dispatch({ type: 'manual', key: 'waiting' });
    let reentries = 0;
    off = counterA.subscribe(() => { if (a.save.isRestoring()) { reentries++; void a.gameplayEvents.dispatch({ type: 'manual', key: 'reentrant' }); } });
    expect(a.save.hydrateBlob(saved)).toBe(true);
    expect((await pending)[0]?.skipped).toBe('cancelled'); release(); await Promise.resolve();
    expect(reentries).toBeGreaterThan(0);
    for (const item of ['late', 'following', 'reentrant']) expect(counterA.count(item)).toBe(0);
    expect(a.gameplayEvents.state.flags['late']).toBeUndefined();
    expect((await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' }))[0]?.skipped).toBe('already-executed');
    await b.gameplayEvents.dispatch({ type: 'manual', key: 'other' }); expect(counterB.count('other')).toBe(1);
    off(); off = () => {}; await a.dispose(); await a.setup(); a.save.hydrateBlob(saved);
    expect((await a.gameplayEvents.dispatch({ type: 'manual', key: 'once' }))[0]?.skipped).toBe('already-executed');
    expect(counterA.count('once')).toBe(1);
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
