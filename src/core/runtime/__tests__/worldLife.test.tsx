import { act, render } from '@testing-library/react';

import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';
import { useCatalogTracker } from '../../catalog/hooks/useCatalogTracker';
import { createCatalogPlugin } from '../../catalog/plugin';
import { getRecipeRegistry } from '../../crafting/registry/RecipeRegistry';
import { createInventoryPlugin } from '../../inventory/plugin';
import { useDecorationScore } from '../../town/hooks/useDecorationScore';
import { useToolUse } from '../../tools/hooks/useToolUse';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('two catalog consumers share one scan and neither hydration nor rollback counts restored items as acquired', async () => {
  const runtime = createGaesupRuntime({ plugins: [createCatalogPlugin(), createInventoryPlugin()] });
  await runtime.setup();
  const original = runtime.inventoryStore.subscribe; let unsubscribed = 0;
  const subscribe = jest.spyOn(runtime.inventoryStore, 'subscribe').mockImplementation(listener => {
    const off = original(listener); return () => { unsubscribed++; off(); };
  });
  function Tracker() { useCatalogTracker(); return null; }
  const tree = (count: number) => <GaesupRuntimeProvider runtime={runtime}>{Array.from({ length: count }, (_, id) => <Tracker key={id} />)}</GaesupRuntimeProvider>;
  const view = render(tree(2));
  try {
    expect(subscribe).toHaveBeenCalledTimes(1);
    runtime.inventoryStore.getState().add('tracked', 3);
    expect(runtime.catalogStore.getState().get('tracked')?.totalCollected).toBe(3);
    const saved = runtime.save.createBlob();
    expect(saved.domains['inventory']).not.toHaveProperty('hydrationRevision');
    runtime.inventoryStore.getState().clear(); runtime.save.hydrateBlob(saved);
    expect(runtime.catalogStore.getState().get('tracked')?.totalCollected).toBe(3);
    runtime.inventoryStore.getState().clear();
    runtime.save.register({ key: 'fail', serialize: () => ({ fail: false }), hydrate: value => { if (value?.fail) throw new Error('reject snapshot'); } });
    expect(() => runtime.save.hydrateBlob({ ...saved, domains: { ...saved.domains, fail: { fail: true } } })).toThrow('Save hydration failed');
    expect(runtime.inventoryStore.getState().countOf('tracked')).toBe(0);
    expect(runtime.catalogStore.getState().get('tracked')?.totalCollected).toBe(3);
    view.rerender(tree(1)); expect(unsubscribed).toBe(0);
    runtime.inventoryStore.getState().add('tracked', 1);
    expect(runtime.catalogStore.getState().get('tracked')?.totalCollected).toBe(4);
    await act(async () => { await runtime.dispose(); }); expect(unsubscribed).toBe(1);
    await act(async () => { await runtime.setup(); }); expect(subscribe).toHaveBeenCalledTimes(2);
    view.unmount(); expect(unsubscribed).toBe(2);
  } finally { view.unmount(); subscribe.mockRestore(); await runtime.dispose(); }
});

test('actual catalog, decoration, and tool consumers keep the owning world across disposal and restart', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  await a.setup(); await b.setup();
  const hits = { A: 0, B: 0 };
  function Consumer({ id }: { id: 'A' | 'B' }) {
    useCatalogTracker(); useDecorationScore(true, { base: id === 'A' ? 10 : 20 });
    useToolUse('shovel', () => { hits[id]++; });
    return null;
  }
  const view = render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>);
  const event = { kind: 'shovel' as const, origin: [0, 0, 0] as [number, number, number], direction: [0, 0, 1] as [number, number, number], range: 2, timestamp: 0 };
  try {
    act(() => { a.inventoryStore.getState().add('owned-life-item', 1); a.toolEvents.emit(event); });
    expect(a.catalogStore.getState().get('owned-life-item')?.totalCollected).toBe(1);
    expect(b.catalogStore.getState().has('owned-life-item')).toBe(false);
    expect(a.townStore.getState().decorationScore).toBe(10); expect(b.townStore.getState().decorationScore).toBe(20);
    expect(hits).toEqual({ A: 1, B: 0 });
    await act(async () => { await a.dispose(); });
    a.toolEvents.emit(event); b.toolEvents.emit(event);
    expect(hits).toEqual({ A: 1, B: 1 });
    await act(async () => { await a.setup(); });
    a.toolEvents.emit(event); expect(hits).toEqual({ A: 2, B: 1 });
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('crafting consumes and produces only owned items and mail claims guard reentry per world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const recipes = getRecipeRegistry(); const original = recipes.all();
  const id = 'owned-life-recipe';
  recipes.register({ id, name: '', ingredients: [{ itemId: 'ingredient', count: 1 }], output: { itemId: 'crafted', count: 1 }, requireBells: 10 });
  try {
    a.walletStore.getState().set(100); b.walletStore.getState().set(100);
    a.inventoryStore.getState().add('ingredient', 1); a.craftingStore.getState().unlock(id);
    expect(a.craftingStore.getState().craft(id).ok).toBe(true);
    expect(a.inventoryStore.getState().countOf('crafted')).toBe(1); expect(a.inventoryStore.getState().countOf('ingredient')).toBe(0);
    expect(a.walletStore.getState().bells).toBe(90); expect(b.walletStore.getState().bells).toBe(100);
    expect(b.craftingStore.getState().isUnlocked(id)).toBe(false); expect(b.inventoryStore.getState().countOf('crafted')).toBe(0);
    const mail = { id: 'same', from: 'test', subject: '', body: '', sentDay: 0, attachments: [{ bells: 5 }] };
    a.mailStore.getState().send(mail); b.mailStore.getState().send(mail);
    const results: boolean[] = [];
    const off = a.walletStore.subscribe(() => { results.push(a.mailStore.getState().claim('same'), b.mailStore.getState().claim('same')); });
    try {
      expect(a.mailStore.getState().claim('same')).toBe(true); expect(results).toEqual([false, true]);
      expect(a.walletStore.getState().bells).toBe(95); expect(b.walletStore.getState().bells).toBe(105);
    } finally { off(); }
  } finally { recipes.clear(); recipes.registerAll(original); await a.dispose(); await b.dispose(); }
});

test('owned gameplay actions emit to their plugin bus and a disposed async generation cannot reward its world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  await a.setup(); await b.setup();
  const receivedA = jest.fn(); const receivedB = jest.fn();
  a.plugins.context.events.on('rewarded', receivedA); b.plugins.context.events.on('rewarded', receivedB);
  let release!: (value: boolean) => void;
  a.gameplayEventRegistry.registerCondition('custom', () => new Promise<boolean>(resolve => { release = resolve; }));
  const blueprint = { id: 'same', name: '', trigger: { type: 'manual' as const, key: 'run' }, actions: [
    { type: 'giveItem' as const, itemId: 'event-item' }, { type: 'emit' as const, eventName: 'rewarded', payload: { owner: 'B' } },
  ], policy: { run: 'once' as const } };
  a.gameplayEvents.setBlueprints([{ ...blueprint, conditions: [{ type: 'custom', key: 'wait' }] }]);
  b.gameplayEvents.setBlueprints([blueprint]);
  try {
    const pending = a.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    await b.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    await a.dispose(); release(true); await pending;
    expect(a.inventoryStore.getState().countOf('event-item')).toBe(0);
    expect(b.inventoryStore.getState().countOf('event-item')).toBe(1);
    expect(receivedA).not.toHaveBeenCalled(); expect(receivedB).toHaveBeenCalledWith({ owner: 'B' });
    await a.setup(); a.gameplayEvents.setBlueprints([blueprint]);
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    expect(a.inventoryStore.getState().countOf('event-item')).toBe(1);
  } finally { await a.dispose(); await b.dispose(); }
});
