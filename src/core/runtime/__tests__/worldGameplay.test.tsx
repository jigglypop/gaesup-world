import { act, renderHook } from '@testing-library/react';

import { useBuildingStore, useBuildingStoreApi } from '../../building/stores/buildingStore';
import { useWeatherStore } from '../../weather/stores/weatherStore';
import { GaesupRuntimeProvider } from '../context';
import { createGaesupRuntime } from '../createGaesupRuntime';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));

test('scoped hooks and imperative APIs follow a replaced Provider and leave the legacy store alone', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const legacy = useBuildingStore.getState();
  a.weatherStore.getState().setWeather('rain', 0.7, 0);
  b.weatherStore.getState().setWeather('sunny', 0.2, 0);
  let renders = 0;
  let active = a;
  const view = renderHook(() => {
    renders++;
    return { weather: useWeatherStore(s => s.current?.kind), height: useBuildingStore(s => s.currentTileHeight), building: useBuildingStoreApi() };
  }, { wrapper: ({ children }) => <GaesupRuntimeProvider runtime={active}>{children}</GaesupRuntimeProvider> });
  try {
    expect(view.result.current.weather).toBe('rain');
    expect(view.result.current.building).toBe(a.buildingStore);
    active = b; view.rerender();
    expect(view.result.current.weather).toBe('sunny');
    expect(view.result.current.building).toBe(b.buildingStore);
    const count = renders;
    act(() => { a.buildingStore.getState().setTileHeight(2); a.weatherStore.getState().setWeather('snow', 1, 1); });
    expect(renders).toBe(count);
    act(() => { view.result.current.building.getState().setTileHeight(3); });
    expect(b.buildingStore.getState().currentTileHeight).toBe(3);
    expect(useBuildingStore.getState()).toBe(legacy);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('owned gameplay actions emit to their plugin bus and a disposed async generation cannot act on its world', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  await a.setup(); await b.setup();
  const receivedA = jest.fn(); const receivedB = jest.fn();
  a.plugins.context.events.on('rewarded', receivedA); b.plugins.context.events.on('rewarded', receivedB);
  let release!: (value: boolean) => void;
  a.gameplayEventRegistry.registerCondition('custom', () => new Promise<boolean>(resolve => { release = resolve; }));
  const blueprint = { id: 'same', name: '', trigger: { type: 'manual' as const, key: 'run' }, actions: [
    { type: 'setFlag' as const, key: 'rewarded', value: true }, { type: 'emit' as const, eventName: 'rewarded', payload: { owner: 'B' } },
  ], policy: { run: 'once' as const } };
  a.gameplayEvents.setBlueprints([{ ...blueprint, conditions: [{ type: 'custom', key: 'wait' }] }]);
  b.gameplayEvents.setBlueprints([blueprint]);
  try {
    const pending = a.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    await b.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    await a.dispose(); release(true); await pending;
    expect(a.gameplayEvents.state.flags['rewarded']).toBeUndefined();
    expect(b.gameplayEvents.state.flags['rewarded']).toBe(true);
    expect(receivedA).not.toHaveBeenCalled(); expect(receivedB).toHaveBeenCalledWith({ owner: 'B' });
    await a.setup(); a.gameplayEvents.setBlueprints([blueprint]);
    await a.gameplayEvents.dispatch({ type: 'manual', key: 'run' });
    expect(a.gameplayEvents.state.flags['rewarded']).toBe(true);
    expect(receivedA).toHaveBeenCalledWith({ owner: 'B' });
  } finally { await a.dispose(); await b.dispose(); }
});
