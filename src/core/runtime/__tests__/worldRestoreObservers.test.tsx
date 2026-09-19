import { act, render, renderHook } from '@testing-library/react';

import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';
import { createEventsPlugin } from '../../events/plugin';
import { getEventRegistry } from '../../events/registry/EventRegistry';
import { useEventsTicker } from '../../events/hooks/useEventsTicker';
import { createFarmingPlugin } from '../../farming/plugin';
import { createInventoryPlugin } from '../../inventory/plugin';
import { createQuestsPlugin } from '../../quests/plugin';
import { useQuestObjectiveTracker } from '../../quests/hooks/useQuestObjectiveTracker';
import { createTimePlugin } from '../../time/plugin';
import { createWeatherPlugin } from '../../weather/plugin';
import { useWeatherTicker } from '../../weather/hooks/useWeatherTicker';

test('duplicate calendar consumers share work, use the latest callbacks and retain the remaining owner on unmount', async () => {
  const runtime = createGaesupRuntime(); runtime.timeStore.getState().setTotalMinutes(0); await runtime.setup();
  const registry = getEventRegistry(); const previous = registry.all(); const time = runtime.timeStore.getState().time;
  registry.register({ id: 'observer-calendar', name: '', triggers: [{ kind: 'monthDay', month: time.month, day: time.day }] });
  const subscribe = jest.spyOn(runtime.timeStore, 'subscribe'); const refresh = jest.spyOn(runtime.eventsStore.getState(), 'refresh');
  const first = jest.fn(); const stale = jest.fn(); const latest = jest.fn();
  function Consumer({ ended }: { ended: () => void }) { useEventsTicker(true, { onEnded: ended }); return null; }
  const content = (both: boolean, ended: () => void) => <GaesupRuntimeProvider runtime={runtime}>{both && <Consumer key="a" ended={first} />}<Consumer key="b" ended={ended} /></GaesupRuntimeProvider>;
  const view = render(content(true, stale));
  try {
    expect(subscribe).toHaveBeenCalledTimes(1); view.rerender(content(true, latest)); expect(subscribe).toHaveBeenCalledTimes(1); refresh.mockClear();
    act(() => runtime.timeStore.getState().setTotalMinutes(1440)); expect(refresh).toHaveBeenCalledTimes(1); expect(first).toHaveBeenCalledTimes(1); expect(latest).toHaveBeenCalledTimes(1); expect(stale).not.toHaveBeenCalled();
    view.rerender(content(false, latest)); act(() => { runtime.timeStore.getState().setTotalMinutes(0); runtime.timeStore.getState().setTotalMinutes(1440); }); expect(first).toHaveBeenCalledTimes(1); expect(latest).toHaveBeenCalledTimes(2); expect(subscribe).toHaveBeenCalledTimes(1);
    await act(async () => { await runtime.dispose(); }); refresh.mockClear(); act(() => runtime.timeStore.getState().setTotalMinutes(0)); expect(refresh).not.toHaveBeenCalled();
  } finally { view.unmount(); await runtime.dispose(); registry.clear(); registry.registerAll(previous); }
});

test.each([false, true])('commit and rollback suppress derived work for either binding order (time first: %s)', async timeFirst => {
  const plugins = [createWeatherPlugin(), createEventsPlugin(), createQuestsPlugin(), createInventoryPlugin(), createFarmingPlugin()];
  const time = createTimePlugin(); const runtime = createGaesupRuntime({ plugins: timeFirst ? [time, ...plugins] : [...plugins, time] });
  runtime.timeStore.getState().setTotalMinutes(0); await runtime.setup();
  const weather = jest.spyOn(runtime.weatherStore.getState(), 'rollForDay'); const events = jest.spyOn(runtime.eventsStore.getState(), 'refresh'); const farming = jest.spyOn(runtime.plotStore.getState(), 'tick'); const quests = jest.spyOn(runtime.questStore.getState(), 'active'); const notification = jest.fn();
  function Observers() { useWeatherTicker(); useEventsTicker(true, { onStarted: notification, onEnded: notification }); useQuestObjectiveTracker(); return null; }
  const view = render(<GaesupRuntimeProvider runtime={runtime}><Observers /><Observers /></GaesupRuntimeProvider>);
  const off = runtime.save.register({ key: 'broken', serialize: () => 1, hydrate: value => { if (value === 99) throw new Error('apply'); } });
  try {
    act(() => runtime.inventoryStore.getState().add('saved', 1)); const saved = runtime.save.createBlob();
    act(() => { runtime.timeStore.getState().setTotalMinutes(1440); runtime.inventoryStore.getState().add('saved', 1); }); const beforeFailure = runtime.save.createBlob();
    for (const spy of [weather, events, farming, quests, notification]) spy.mockClear();
    act(() => { expect(() => runtime.save.hydrateBlob({ ...saved, domains: { ...saved.domains, broken: 99 } })).toThrow('previous state restored'); });
    expect(runtime.save.createBlob().domains).toEqual(beforeFailure.domains); expect(runtime.save.isRestoring()).toBe(false);
    for (const spy of [weather, events, farming, quests, notification]) expect(spy).not.toHaveBeenCalled();
    act(() => { expect(runtime.save.hydrateBlob(saved)).toBe(true); }); expect(runtime.timeStore.getState().totalMinutes).toBe(0); expect(runtime.inventoryStore.getState().countOf('saved')).toBe(1);
    for (const spy of [weather, events, farming, quests, notification]) expect(spy).not.toHaveBeenCalled();
    act(() => runtime.timeStore.getState().setTotalMinutes(2880)); expect(events).toHaveBeenCalledTimes(1); expect(farming).toHaveBeenCalledTimes(1);
  } finally { off(); view.unmount(); await runtime.dispose(); }
});

test('a restore guard also suppresses nested store commands issued by application observers', async () => {
  const runtime = createGaesupRuntime({ plugins: [createTimePlugin(), createInventoryPlugin(), createFarmingPlugin()] }); await runtime.setup();
  const events = jest.spyOn(runtime.eventsStore.getState(), 'refresh'); const farming = jest.spyOn(runtime.plotStore.getState(), 'tick');
  const view = renderHook(() => { useEventsTicker(); useQuestObjectiveTracker(); }, { wrapper: ({ children }) => <GaesupRuntimeProvider runtime={runtime}>{children}</GaesupRuntimeProvider> });
  const snapshot = runtime.save.createBlob(); const off = runtime.timeStore.subscribe((state, previous) => { if (state.hydrationRevision !== previous.hydrationRevision) runtime.timeStore.getState().setTotalMinutes(3000); });
  try { events.mockClear(); farming.mockClear(); act(() => { runtime.save.hydrateBlob(snapshot); }); expect(events).not.toHaveBeenCalled(); expect(farming).not.toHaveBeenCalled(); }
  finally { off(); view.unmount(); await runtime.dispose(); }
});

test('fifty runtime generations release all observer leases while mounted hooks reconnect once', async () => {
  const runtime = createGaesupRuntime(); let activeTime = 0; let activeInventory = 0;
  const subscribeTime = runtime.timeStore.subscribe; const subscribeInventory = runtime.inventoryStore.subscribe;
  runtime.timeStore.subscribe = listener => { activeTime++; const off = subscribeTime(listener); return () => { activeTime--; off(); }; };
  runtime.inventoryStore.subscribe = listener => { activeInventory++; const off = subscribeInventory(listener); return () => { activeInventory--; off(); }; };
  function Observers() { useWeatherTicker(); useEventsTicker(); useQuestObjectiveTracker(); return null; }
  const view = render(<GaesupRuntimeProvider runtime={runtime}><Observers /><Observers /></GaesupRuntimeProvider>);
  try {
    expect([activeTime, activeInventory]).toEqual([0, 0]);
    for (let cycle = 0; cycle < 50; cycle++) {
      await act(async () => { await runtime.setup(); }); expect([activeTime, activeInventory]).toEqual([2, 1]);
      await act(async () => { await runtime.dispose(); }); expect([activeTime, activeInventory]).toEqual([0, 0]);
    }
  } finally { view.unmount(); await runtime.dispose(); runtime.timeStore.subscribe = subscribeTime; runtime.inventoryStore.subscribe = subscribeInventory; }
});

test('a disposal requested during hydration cancels and rolls back before the next domain applies', async () => {
  const runtime = createGaesupRuntime({ plugins: [createTimePlugin()] }); await runtime.setup(); runtime.timeStore.getState().setTotalMinutes(0);
  const blob = runtime.save.createBlob(); const time = runtime.timeStore.getState().serialize(); blob.domains['time'] = { ...time, totalMinutes: 1440 };
  let disposing: Promise<void> | undefined; const off = runtime.timeStore.subscribe(state => { if (state.totalMinutes === 1440) disposing = runtime.dispose(); });
  try { expect(runtime.save.hydrateBlob(blob)).toBe(false); expect(runtime.timeStore.getState().totalMinutes).toBe(0); await disposing; expect(runtime.isActive()).toBe(false); }
  finally { off(); await runtime.dispose(); }
});

test('a failed transaction restores the previous paused clock as well as its time', async () => {
  const runtime = createGaesupRuntime({ plugins: [createTimePlugin()] }); await runtime.setup(); runtime.timeStore.getState().setTotalMinutes(100); runtime.timeStore.getState().pause();
  const off = runtime.save.register({ key: 'failure', serialize: () => 1, hydrate: value => { if (value === 2) throw new Error('apply'); } });
  const snapshot = runtime.save.createBlob(); snapshot.domains['time'] = { ...runtime.timeStore.getState().serialize(), totalMinutes: 200, pausedAt: null }; snapshot.domains['failure'] = 2;
  try { expect(() => runtime.save.hydrateBlob(snapshot)).toThrow('previous state restored'); expect(runtime.timeStore.getState().paused).toBe(true); expect(runtime.timeStore.getState().totalMinutes).toBe(100); }
  finally { off(); await runtime.dispose(); }
});
