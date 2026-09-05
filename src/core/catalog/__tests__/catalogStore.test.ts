import { useCatalogStore } from '../stores/catalogStore';

beforeEach(() => {
  useCatalogStore.setState({ entries: {} });
});

describe('catalogStore', () => {
  test('record adds new entry', () => {
    useCatalogStore.getState().record('apple', 1, 0);
    expect(useCatalogStore.getState().has('apple')).toBe(true);
    expect(useCatalogStore.getState().get('apple')!.totalCollected).toBe(1);
    expect(useCatalogStore.getState().get('apple')!.firstSeenDay).toBe(0);
  });

  test('record accumulates totalCollected without overwriting firstSeenDay', () => {
    useCatalogStore.getState().record('apple', 2, 0);
    useCatalogStore.getState().record('apple', 3, 5);
    expect(useCatalogStore.getState().get('apple')!.totalCollected).toBe(5);
    expect(useCatalogStore.getState().get('apple')!.firstSeenDay).toBe(0);
  });

  test('size reflects unique items', () => {
    useCatalogStore.getState().record('apple', 1, 0);
    useCatalogStore.getState().record('wood', 1, 0);
    expect(useCatalogStore.getState().size()).toBe(2);
  });

  test('serialize/hydrate roundtrip', () => {
    useCatalogStore.getState().record('apple', 4, 2);
    const blob = useCatalogStore.getState().serialize();
    useCatalogStore.setState({ entries: {} });
    useCatalogStore.getState().hydrate(blob);
    expect(useCatalogStore.getState().get('apple')!.totalCollected).toBe(4);
    expect(useCatalogStore.getState().get('apple')!.firstSeenDay).toBe(2);
  });
});
