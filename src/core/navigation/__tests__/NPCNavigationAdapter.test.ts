import {
  applyNPCNavigationRoute,
  createNPCNavigationRoute,
} from '../NPCNavigationAdapter';
import { NavigationSystem } from '../NavigationSystem';

jest.mock('../../wasm/loader', () => ({
  loadCoreWasm: jest.fn(async () => null),
}));

const TEST_CONFIG = {
  cellSize: 1,
  worldMinX: 0,
  worldMinZ: 0,
  worldMaxX: 6,
  worldMaxZ: 6,
};

afterEach(() => {
  NavigationSystem.getInstance().dispose();
});

describe('NPCNavigationAdapter', () => {
  it('creates NPC-ready waypoints without repeating the current position', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    const route = createNPCNavigationRoute(
      navigation,
      { id: 'npc-1', position: [0.5, 0, 0.5] },
      [3.5, 2, 0.5],
      { simplify: false },
    );

    expect(route).toEqual([
      [1.5, 2, 0.5],
      [2.5, 2, 0.5],
      [3.5, 2, 0.5],
    ]);
  });

  it('can include the current position for consumers that need the full route', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    const route = createNPCNavigationRoute(
      navigation,
      { id: 'npc-1', position: [0.5, 0, 0.5] },
      [2.5, 0, 0.5],
      { includeStart: true, simplify: false },
    );

    expect(route[0]).toEqual([0.5, 0, 0.5]);
    expect(route[route.length - 1]).toEqual([2.5, 0, 0.5]);
  });

  it('applies the route to an NPC navigation setter', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    const setNavigation = jest.fn();
    await navigation.init();

    const route = applyNPCNavigationRoute(
      navigation,
      { id: 'npc-1', position: [0.5, 0, 0.5] },
      [3.5, 1, 0.5],
      setNavigation,
      { speed: 2.5, simplify: false },
    );

    expect(setNavigation).toHaveBeenCalledWith('npc-1', route, 2.5);
    expect(route[0]).toEqual([1.5, 1, 0.5]);
    expect(route[route.length - 1]).toEqual([3.5, 1, 0.5]);
  });

  it('optionally clears navigation when no route is available', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    const setNavigation = jest.fn();
    const clearNavigation = jest.fn();
    await navigation.init();

    navigation.setBlocked(3.5, 0.5, 1, 1);

    const route = applyNPCNavigationRoute(
      navigation,
      { id: 'npc-1', position: [0.5, 0, 0.5] },
      [3.5, 0, 0.5],
      setNavigation,
      { clearOnFail: true, clearNavigation },
    );

    expect(route).toEqual([]);
    expect(setNavigation).not.toHaveBeenCalled();
    expect(clearNavigation).toHaveBeenCalledWith('npc-1');
  });
});
