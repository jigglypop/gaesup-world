import { useTownStore } from '../stores/townStore';
import type { TownSerialized } from '../types';

beforeEach(() => {
  useTownStore.setState({ houses: {}, residents: {}, decorationScore: 0 });
});

describe('townStore', () => {
  test.each([{ position: [0, Infinity, 0] }, { size: [0, 4] }, { size: [4] },
    { state: 'unknown' }, { reservedFor: '' }, { reservedUntilDay: -1 }])('rejects malformed houses: %j', (patch) => {
    const before = useTownStore.getState();
    const data = { version: 1, houses: [{ id: 'h', position: [0, 0, 0], size: [4, 4], state: 'empty', ...patch }], residents: [] };
    expect(() => before.hydrate(data as unknown as TownSerialized)).toThrow(TypeError);
    expect(useTownStore.getState()).toBe(before);
  });

  test.each([{ name: 1 }, { movedInDay: NaN }, { npcId: '' }, { hatColor: 1 }])('rejects malformed residents: %j', (patch) => {
    const before = useTownStore.getState();
    expect(() => before.prepareHydrate({ version: 1, houses: [], residents: [{ id: 'r', name: '주민', ...patch }] } as unknown as TownSerialized)).toThrow(TypeError);
    expect(useTownStore.getState()).toBe(before);
  });

  test('owns prepared house dimensions and preserves custom references and decoration state', () => {
    useTownStore.getState().setDecorationScore(7);
    const before = useTownStore.getState();
    const data: TownSerialized = { version: 1, houses: [{ id: 'h', position: [1, 2, 3], size: [4, 5],
      state: 'reserved', reservedFor: 'custom' }], residents: [{ id: 'r', name: '주민', npcId: 'custom-npc' }] };
    const apply = before.prepareHydrate(data);
    expect(useTownStore.getState()).toBe(before);
    data.houses[0]!.position[0] = 99;
    data.houses[0]!.size[0] = 99;
    data.residents[0]!.name = '변경';
    apply();
    expect(useTownStore.getState().houses.h).toMatchObject({ position: [1, 2, 3], size: [4, 5], reservedFor: 'custom' });
    expect(useTownStore.getState().residents.r?.name).toBe('주민');
    expect(useTownStore.getState().decorationScore).toBe(7);
    const saved = useTownStore.getState().serialize();
    saved.houses[0]!.position[1] = 99;
    saved.houses[0]!.size[1] = 99;
    expect(useTownStore.getState().houses.h).toMatchObject({ position: [1, 2, 3], size: [4, 5] });
    expect(() => before.prepareHydrate({ ...data, houses: [data.houses[0]!, data.houses[0]!] })).toThrow(TypeError);
    expect(() => before.prepareHydrate({ ...data, residents: [data.residents[0]!, data.residents[0]!] })).toThrow(TypeError);
    const current = useTownStore.getState();
    current.hydrate(undefined);
    expect(useTownStore.getState()).toBe(current);
    current.hydrate({ version: 1, houses: [], residents: [] });
    expect(useTownStore.getState().houses).toEqual({});
    expect(useTownStore.getState().residents).toEqual({});
  });

  test('register house defaults to empty', () => {
    useTownStore.getState().registerHouse({ id: 'h1', position: [0, 0, 0] });
    expect(useTownStore.getState().houses.h1?.state).toBe('empty');
  });

  test('reserve / cancel reservation flow', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [0, 0, 0] });
    t.registerResident({ id: 'r1', name: 'A' });
    expect(t.reserveHouse('h1', 'r1', 5)).toBe(true);
    expect(useTownStore.getState().houses.h1?.state).toBe('reserved');
    expect(useTownStore.getState().houses.h1?.reservedFor).toBe('r1');
    expect(t.reserveHouse('h1', 'r1')).toBe(false);
    t.cancelReservation('h1');
    expect(useTownStore.getState().houses.h1?.state).toBe('empty');
  });

  test('moveIn marks house occupied and sets resident moved-in day', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [0, 0, 0] });
    t.registerResident({ id: 'r1', name: 'A' });
    expect(t.moveIn('h1', 'r1', 7)).toBe(true);
    const s = useTownStore.getState();
    expect(s.houses.h1?.state).toBe('occupied');
    expect(s.houses.h1?.residentId).toBe('r1');
    expect(s.residents.r1?.movedInDay).toBe(7);
  });

  test('moveOut clears occupied house', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [0, 0, 0] });
    t.registerResident({ id: 'r1', name: 'A' });
    t.moveIn('h1', 'r1', 0);
    expect(t.moveOut('h1')).toBe(true);
    expect(useTownStore.getState().houses.h1?.state).toBe('empty');
  });

  test('removeResident also clears their house and reservations', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [0, 0, 0] });
    t.registerHouse({ id: 'h2', position: [4, 0, 0] });
    t.registerResident({ id: 'r1', name: 'A' });
    t.registerResident({ id: 'r2', name: 'B' });
    t.moveIn('h1', 'r1', 0);
    t.reserveHouse('h2', 'r2');
    t.removeResident('r1');
    t.removeResident('r2');
    const s = useTownStore.getState();
    expect(s.houses.h1?.state).toBe('empty');
    expect(s.houses.h2?.state).toBe('empty');
    expect(Object.keys(s.residents)).toEqual([]);
  });

  test('stats returns counts', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [0, 0, 0] });
    t.registerHouse({ id: 'h2', position: [4, 0, 0] });
    t.registerResident({ id: 'r1', name: 'A' });
    t.moveIn('h1', 'r1', 0);
    t.setDecorationScore(42);
    const s = t.stats();
    expect(s).toMatchObject({ decorationScore: 42, residentCount: 1, occupiedHouses: 1, totalHouses: 2 });
  });

  test('serialize / hydrate round trip', () => {
    const t = useTownStore.getState();
    t.registerHouse({ id: 'h1', position: [1, 0, 1] });
    t.registerResident({ id: 'r1', name: 'A' });
    t.moveIn('h1', 'r1', 5);
    const data = t.serialize();
    useTownStore.setState({ houses: {}, residents: {}, decorationScore: 0 });
    useTownStore.getState().hydrate(data);
    const s = useTownStore.getState();
    expect(s.houses.h1?.state).toBe('occupied');
    expect(s.residents.r1?.movedInDay).toBe(5);
  });
});
