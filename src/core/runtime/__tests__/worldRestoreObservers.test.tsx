import { act, render, renderHook } from '@testing-library/react';

import { dayOfTotalMinutes } from '../../time/core/Clock';
import { createTimePlugin } from '../../time/plugin';
import { useWeatherTicker } from '../../weather/hooks/useWeatherTicker';
import { createWeatherPlugin } from '../../weather/plugin';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

test('a restore guard also suppresses nested store commands issued by application observers', async () => {
  const runtime = createGaesupRuntime({ plugins: [createTimePlugin(), createWeatherPlugin()] }); await runtime.setup();
  const view = renderHook(() => { useWeatherTicker(); }, { wrapper: ({ children }) => <GaesupRuntimeProvider runtime={runtime}>{children}</GaesupRuntimeProvider> });
  const snapshot = runtime.save.createBlob();
  const off = runtime.timeStore.subscribe((state, previous) => { if (state.hydrationRevision !== previous.hydrationRevision) runtime.timeStore.getState().setTotalMinutes(3000); });
  // The observer moves time to another day; restoring weather afterwards would hide a roll, so count the rolls.
  const rolls = jest.fn(runtime.weatherStore.getState().rollForDay);
  runtime.weatherStore.setState({ rollForDay: rolls });
  try {
    expect(dayOfTotalMinutes(3000)).not.toBe(dayOfTotalMinutes(runtime.timeStore.getState().totalMinutes));
    act(() => { runtime.save.hydrateBlob(snapshot); });
    expect(runtime.timeStore.getState().totalMinutes).toBe(3000);
    expect(rolls).not.toHaveBeenCalled();
  } finally { off(); view.unmount(); await runtime.dispose(); }
});

test('fifty runtime generations release all observer leases while mounted hooks reconnect once', async () => {
  const runtime = createGaesupRuntime(); let activeTime = 0;
  const subscribeTime = runtime.timeStore.subscribe;
  runtime.timeStore.subscribe = listener => { activeTime++; const off = subscribeTime(listener); return () => { activeTime--; off(); }; };
  function Observers() { useWeatherTicker(); return null; }
  const view = render(<GaesupRuntimeProvider runtime={runtime}><Observers /><Observers /></GaesupRuntimeProvider>);
  try {
    expect(activeTime).toBe(0);
    for (let cycle = 0; cycle < 50; cycle++) {
      await act(async () => { await runtime.setup(); }); expect(activeTime).toBe(1);
      await act(async () => { await runtime.dispose(); }); expect(activeTime).toBe(0);
    }
  } finally { view.unmount(); await runtime.dispose(); runtime.timeStore.subscribe = subscribeTime; }
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
