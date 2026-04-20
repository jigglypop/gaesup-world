import { useTownStore } from '../stores/townStore';

beforeEach(() => {
  useTownStore.setState({ houses: {}, residents: {}, decorationScore: 0 });
});

describe('townStore', () => {
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
