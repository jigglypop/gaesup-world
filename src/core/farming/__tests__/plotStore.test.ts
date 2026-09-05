import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { getItemRegistry } from '../../items/registry/ItemRegistry';
import { registerSeedCrops } from '../data/crops';
import { getCropRegistry } from '../registry/CropRegistry';
import { usePlotStore } from '../stores/plotStore';
import type { FarmingSerialized } from '../types';

beforeAll(() => {
  registerSeedItems();
  registerSeedCrops();
});

beforeEach(() => {
  usePlotStore.setState({ plots: {} });
  useInventoryStore.getState().clear();
});

describe('plotStore', () => {
  test('insufficient harvest space preserves both crop and inventory until a complete retry', () => {
    getItemRegistry().register({ id: 'harvest-test', name: '수확물', icon: '', category: 'food', stackable: true, maxStack: 10 });
    const crop = { ...getCropRegistry().require('crop.turnip'), id: 'crop.harvest-capacity', yieldItemId: 'harvest-test', yieldCount: 3 };
    getCropRegistry().register(crop);
    const maxStack = getItemRegistry().require(crop.yieldItemId).maxStack;
    const slots = useInventoryStore.getState().slots.map(() => ({ itemId: crop.yieldItemId, count: maxStack }));
    slots[0] = { itemId: crop.yieldItemId, count: maxStack - 1 };
    useInventoryStore.setState({ slots });
    usePlotStore.getState().registerPlot({ id: 'ready', position: [0, 0, 0], state: 'mature', cropId: crop.id, stageIndex: 2 });
    const beforeInventory = useInventoryStore.getState();
    const beforePlots = usePlotStore.getState();
    expect(beforePlots.harvest('ready')).toBe(false);
    expect(beforePlots.harvest('ready')).toBe(false);
    expect(useInventoryStore.getState()).toBe(beforeInventory);
    expect(usePlotStore.getState()).toBe(beforePlots);
    const saved = beforePlots.serialize();
    beforePlots.hydrate(saved);
    useInventoryStore.getState().remove(0, 2);
    const beforeCount = useInventoryStore.getState().countOf(crop.yieldItemId);
    expect(usePlotStore.getState().harvest('ready')).toBe(true);
    expect(useInventoryStore.getState().countOf(crop.yieldItemId)).toBe(beforeCount + 3);
    expect(usePlotStore.getState().plots.ready?.state).toBe('tilled');
    expect(usePlotStore.getState().harvest('ready')).toBe(false);
  });

  test.each([{ position: [0, NaN, 0] }, { position: [0, 0] }, { stageIndex: -1 },
    { state: 'unknown' }, { plantedAt: Infinity }, { lastWateredAt: -1 }, { cropId: '' }])('rejects malformed plots: %j', (patch) => {
    const before = usePlotStore.getState();
    const data = { version: 1, plots: [{ id: 'p', position: [0, 0, 0], state: 'empty', stageIndex: 0, ...patch }] };
    expect(() => before.hydrate(data as unknown as FarmingSerialized)).toThrow(TypeError);
    expect(usePlotStore.getState()).toBe(before);
  });

  test('prepares owned coordinates and accepts custom crops without changing state early', () => {
    const before = usePlotStore.getState();
    const data: FarmingSerialized = { version: 1, plots: [{ id: 'p', position: [1, 2, 3], state: 'planted',
      stageIndex: 0, cropId: 'custom', plantedAt: 0 }] };
    const apply = before.prepareHydrate(data);
    expect(usePlotStore.getState()).toBe(before);
    data.plots[0]!.position[0] = 99;
    apply();
    expect(usePlotStore.getState().plots.p?.position).toEqual([1, 2, 3]);
    expect(usePlotStore.getState().plots.p?.cropId).toBe('custom');
    const saved = usePlotStore.getState().serialize();
    saved.plots[0]!.position[1] = 99;
    expect(usePlotStore.getState().plots.p?.position).toEqual([1, 2, 3]);
    expect(() => before.prepareHydrate({ version: 1, plots: [data.plots[0]!, data.plots[0]!] })).toThrow(TypeError);
    expect(() => before.prepareHydrate({ version: 2, plots: [] })).toThrow(TypeError);
    const current = usePlotStore.getState();
    current.hydrate(null);
    expect(usePlotStore.getState()).toBe(current);
    current.hydrate({ version: 1, plots: [] });
    expect(usePlotStore.getState().plots).toEqual({});
  });

  test('register / till / plant / harvest cycle', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [0, 0, 0] });
    expect(usePlotStore.getState().plots.p1?.state).toBe('empty');

    expect(ps.till('p1')).toBe(true);
    expect(usePlotStore.getState().plots.p1?.state).toBe('tilled');

    useInventoryStore.getState().add('seed-turnip', 3);
    expect(ps.plant('p1', 'crop.turnip', 0)).toBe(true);
    expect(usePlotStore.getState().plots.p1?.state).toBe('planted');
    expect(useInventoryStore.getState().countOf('seed-turnip')).toBe(2);
  });

  test('cannot plant without seeds', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [0, 0, 0] });
    ps.till('p1');
    expect(ps.plant('p1', 'crop.turnip', 0)).toBe(false);
  });

  test('tick advances stage to mature using crop durations', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [0, 0, 0] });
    ps.till('p1');
    useInventoryStore.getState().add('seed-turnip', 1);
    ps.plant('p1', 'crop.turnip', 0);

    const def = getCropRegistry().require('crop.turnip');
    const total = def.stages.reduce((s, st) => s + st.durationMinutes, 0);
    ps.water('p1', total);
    ps.tick(total + 1);
    expect(usePlotStore.getState().plots.p1?.state).toBe('mature');
  });

  test('harvest yields items and resets to tilled', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [0, 0, 0] });
    ps.till('p1');
    useInventoryStore.getState().add('seed-turnip', 1);
    ps.plant('p1', 'crop.turnip', 0);
    const total = getCropRegistry().require('crop.turnip').stages.reduce((s, st) => s + st.durationMinutes, 0);
    ps.water('p1', total);
    ps.tick(total + 1);
    expect(ps.harvest('p1')).toBe(true);
    expect(useInventoryStore.getState().countOf('turnip')).toBe(getCropRegistry().require('crop.turnip').yieldCount);
    expect(usePlotStore.getState().plots.p1?.state).toBe('tilled');
  });

  test('drying after lack of water', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [0, 0, 0] });
    ps.till('p1');
    useInventoryStore.getState().add('seed-turnip', 1);
    ps.plant('p1', 'crop.turnip', 0);
    const def = getCropRegistry().require('crop.turnip');
    ps.tick(def.driedOutMinutes + 1);
    expect(usePlotStore.getState().plots.p1?.state).toBe('dried');

    ps.water('p1', def.driedOutMinutes + 2);
    expect(usePlotStore.getState().plots.p1?.state).toBe('planted');
  });

  test('serialize/hydrate round trip', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'p1', position: [1, 0, 1] });
    ps.till('p1');
    const data = ps.serialize();
    usePlotStore.setState({ plots: {} });
    usePlotStore.getState().hydrate(data);
    expect(usePlotStore.getState().plots.p1?.state).toBe('tilled');
  });

  test('near() returns the closest plot within radius', () => {
    const ps = usePlotStore.getState();
    ps.registerPlot({ id: 'a', position: [0, 0, 0] });
    ps.registerPlot({ id: 'b', position: [10, 0, 0] });
    expect(ps.near(0.5, 0.2, 1.0)?.id).toBe('a');
    expect(ps.near(20, 20, 1.0)).toBeNull();
  });
});
