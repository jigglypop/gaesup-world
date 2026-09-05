import { act } from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { createPluginRegistry } from '../../plugins';
import { useTimeStore } from '../../time/stores/timeStore';
import { getToolEvents } from '../../tools/core/ToolEvents';
import { CropPlot } from '../components/CropPlot';
import { createFarmingPlugin } from '../plugin';
import { getCropRegistry } from '../registry/CropRegistry';
import { usePlotStore } from '../stores/plotStore';

test('many plot views and runtimes share one clock while plots survive view removal', async () => {
  useTimeStore.setState({ totalMinutes: 0 });
  usePlotStore.setState({ plots: {} });
  getCropRegistry().register({ id: 'lifetime-crop', name: '작물', seedItemId: 'seed', yieldItemId: 'fruit', yieldCount: 1,
    waterIntervalMinutes: 10, driedOutMinutes: 100, stages: [{ durationMinutes: 2, scale: 0.2 }, { durationMinutes: 0, scale: 1 }] });
  usePlotStore.getState().registerPlot({ id: 'growing', position: [0, 0, 0], state: 'planted', cropId: 'lifetime-crop',
    plantedAt: 0, lastWateredAt: 0, stageIndex: 0 });
  const originalTick = usePlotStore.getState().tick;
  const tick = jest.fn(originalTick);
  usePlotStore.setState({ tick });
  const subscribe = jest.spyOn(useTimeStore, 'subscribe');
  const first = createPluginRegistry();
  const second = createPluginRegistry();
  const plugin = createFarmingPlugin();
  first.register(plugin);
  second.register(plugin);
  await first.setup(plugin.id);
  await second.setup(plugin.id);
  const view = await ReactThreeTestRenderer.create(<>
    <CropPlot id="growing" position={[0, 0, 0]} />
    {Array.from({ length: 20 }, (_, index) => <CropPlot key={index} id={`plot-${index}`} position={[index, 0, 1]} />)}
  </>);
  try {
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(tick).toHaveBeenCalledTimes(1);
    const growing = usePlotStore.getState().plots.growing;
    await view.update(<CropPlot id="growing" position={[0, 0, 0]} />);
    expect(usePlotStore.getState().plots.growing).toBe(growing);
    expect(Object.keys(usePlotStore.getState().plots)).toHaveLength(21);
    tick.mockClear();
    await act(async () => { useTimeStore.setState({ totalMinutes: 1 }); });
    expect(tick).toHaveBeenCalledTimes(1);
    await view.unmount();
    await first.dispose(plugin.id);
    tick.mockClear();
    useTimeStore.setState({ totalMinutes: 2 });
    expect(tick).toHaveBeenCalledTimes(1);
    expect(usePlotStore.getState().plots.growing?.state).toBe('mature');
    const snapshot = usePlotStore.getState().serialize();
    expect(snapshot.plots).toHaveLength(21);
    await second.dispose(plugin.id);
    tick.mockClear();
    useTimeStore.setState({ totalMinutes: 3 });
    expect(tick).not.toHaveBeenCalled();
    usePlotStore.getState().unregisterPlot('growing');
    expect(usePlotStore.getState().plots.growing).toBeUndefined();
  } finally {
    await view.unmount();
    await first.dispose(plugin.id);
    await second.dispose(plugin.id);
    subscribe.mockRestore();
    usePlotStore.setState({ tick: originalTick, plots: {} });
  }
});

test('unchanged growth preserves the plot record', () => {
  usePlotStore.getState().registerPlot({ id: 'empty', position: [0, 0, 0] });
  const before = usePlotStore.getState();
  before.tick(123);
  expect(usePlotStore.getState()).toBe(before);
});

test('standalone views preserve their plot across remounts and release the clock', async () => {
  const subscribe = jest.spyOn(useTimeStore, 'subscribe');
  const view = await ReactThreeTestRenderer.create(<CropPlot id="standalone" position={[2, 0, 2]} />);
  await act(async () => { usePlotStore.getState().till('standalone'); });
  const tilled = usePlotStore.getState().plots.standalone;
  await view.unmount();
  expect(usePlotStore.getState().plots.standalone).toBe(tilled);
  const remounted = await ReactThreeTestRenderer.create(<CropPlot id="standalone" position={[2, 0, 2]} />);
  expect(usePlotStore.getState().plots.standalone).toBe(tilled);
  expect(subscribe).toHaveBeenCalledTimes(2);
  await remounted.unmount();
  subscribe.mockRestore();
  usePlotStore.getState().unregisterPlot('standalone');
});

test('loaded plot coordinates drive both rendering and tool interactions', async () => {
  const view = await ReactThreeTestRenderer.create(<CropPlot id="loaded-position" position={[0, 0, 0]} />);
  try {
    const snapshot = { version: 1 as const, plots: [{ id: 'loaded-position', position: [10, 0, 10] as [number, number, number], state: 'empty' as const, stageIndex: 0 }] };
    await act(async () => { usePlotStore.getState().hydrate(snapshot); });
    expect(view.scene.findByType('Group').instance.position.toArray()).toEqual([10, 0, 10]);
    await view.update(<CropPlot id="loaded-position" position={[20, 0, 20]} />);
    expect(view.scene.findByType('Group').instance.position.toArray()).toEqual([10, 0, 10]);
    await act(async () => {
      getToolEvents().emit({ kind: 'shovel', origin: [0, 0, 0], direction: [0, 0, 1], range: 2, timestamp: 0 });
    });
    expect(usePlotStore.getState().plots['loaded-position']?.state).toBe('empty');
    await act(async () => {
      getToolEvents().emit({ kind: 'shovel', origin: [10, 0, 10], direction: [0, 0, 1], range: 2, timestamp: 1 });
    });
    expect(usePlotStore.getState().plots['loaded-position']?.state).toBe('tilled');
  } finally {
    await view.unmount();
    usePlotStore.getState().unregisterPlot('loaded-position');
  }
});
