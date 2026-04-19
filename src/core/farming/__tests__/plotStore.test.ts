import { useInventoryStore } from '../../inventory/stores/inventoryStore';
import { registerSeedItems } from '../../items/data/items';
import { registerSeedCrops } from '../data/crops';
import { getCropRegistry } from '../registry/CropRegistry';
import { usePlotStore } from '../stores/plotStore';

beforeAll(() => {
  registerSeedItems();
  registerSeedCrops();
});

beforeEach(() => {
  usePlotStore.setState({ plots: {} });
  useInventoryStore.getState().clear();
});

describe('plotStore', () => {
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
