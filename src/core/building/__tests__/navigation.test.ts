import { NavigationSystem } from '../../navigation';
import { applyBuildingNavigationObstacles } from '../navigation';
import type { TileGroupConfig, WallGroupConfig } from '../types';

jest.mock('../../wasm/loader', () => ({
  loadCoreWasm: jest.fn(async () => null),
}));

const TEST_CONFIG = {
  cellSize: 1,
  worldMinX: 0,
  worldMinZ: 0,
  worldMaxX: 8,
  worldMaxZ: 8,
};

afterEach(() => {
  NavigationSystem.getInstance().dispose();
});

describe('applyBuildingNavigationObstacles', () => {
  it('blocks solid walls and ignores pass-through wall kinds', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    const wallGroups: WallGroupConfig[] = [{
      id: 'walls',
      name: 'Walls',
      walls: [
        {
          id: 'solid',
          wallGroupId: 'walls',
          position: { x: 2.5, y: 0, z: 2.5 },
          rotation: { x: 0, y: 0, z: 0 },
          width: 1,
          depth: 1,
          wallKind: 'solid',
        },
        {
          id: 'door',
          wallGroupId: 'walls',
          position: { x: 4.5, y: 0, z: 2.5 },
          rotation: { x: 0, y: 0, z: 0 },
          width: 1,
          depth: 1,
          wallKind: 'door',
        },
      ],
    }];

    expect(applyBuildingNavigationObstacles(navigation, { wallGroups })).toBe(1);
    expect(navigation.isWalkable(2.5, 2.5)).toBe(false);
    expect(navigation.isWalkable(4.5, 2.5)).toBe(true);
  });

  it('blocks building blocks and placed objects', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    const applied = applyBuildingNavigationObstacles(navigation, {
      blocks: [{
        id: 'block',
        position: { x: 1.5, y: 0, z: 1.5 },
        size: { x: 1, z: 1 },
      }],
      objects: [{
        id: 'tree',
        type: 'tree',
        position: { x: 5.5, y: 0, z: 5.5 },
        config: { size: 1 },
      }],
    });

    expect(applied).toBe(2);
    expect(navigation.isWalkable(1.5, 1.5)).toBe(false);
    expect(navigation.isWalkable(5.5, 5.5)).toBe(false);
  });

  it('uses placed object footprint size when blocking navigation', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    applyBuildingNavigationObstacles(navigation, {
      objects: [{
        id: 'large-tree',
        type: 'tree',
        position: { x: 4.5, y: 0, z: 4.5 },
        config: { size: 3 },
      }],
    });

    expect(navigation.isWalkable(4.5, 4.5)).toBe(false);
    expect(navigation.isWalkable(3.5, 4.5)).toBe(false);
    expect(navigation.isWalkable(1.5, 4.5)).toBe(true);
  });

  it('can reset previous navigation obstacles before applying a new snapshot', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    applyBuildingNavigationObstacles(navigation, {
      objects: [{
        id: 'tree',
        type: 'tree',
        position: { x: 5.5, y: 0, z: 5.5 },
        config: { size: 1 },
      }],
    });
    expect(navigation.isWalkable(5.5, 5.5)).toBe(false);

    applyBuildingNavigationObstacles(navigation, { objects: [] }, { reset: true });
    expect(navigation.isWalkable(5.5, 5.5)).toBe(true);
  });

  it('makes navigation paths avoid applied building obstacles', async () => {
    const navigation = NavigationSystem.getInstance(TEST_CONFIG);
    await navigation.init();

    applyBuildingNavigationObstacles(navigation, {
      objects: [{
        id: 'tree',
        type: 'tree',
        position: { x: 2.5, y: 0, z: 0.5 },
        config: { size: 1 },
      }],
    });

    const path = navigation.findPath(0.5, 0.5, 4.5, 0.5);

    expect(path).not.toContainEqual([2.5, 0, 0.5]);
    expect(path.some(([, , z]) => z > 0.5)).toBe(true);
  });

  it('applies tile, stair, and ramp heights to navigation waypoints', async () => {
    const navigation = NavigationSystem.getInstance({
      cellSize: 1,
      worldMinX: -4,
      worldMinZ: -4,
      worldMaxX: 8,
      worldMaxZ: 8,
    });
    await navigation.init();

    const tileGroups: TileGroupConfig[] = [{
      id: 'floors',
      name: 'Floors',
      floorMeshId: 'wood',
      tiles: [
        {
          id: 'upper-floor',
          tileGroupId: 'floors',
          position: { x: 0, y: 2, z: 0 },
          size: 1,
          shape: 'box',
        },
        {
          id: 'stairs',
          tileGroupId: 'floors',
          position: { x: 4, y: 2, z: 0 },
          size: 1,
          shape: 'stairs',
          rotation: 0,
        },
      ],
    }];

    applyBuildingNavigationObstacles(navigation, { tileGroups });

    expect(navigation.sampleHeight(0, 0)).toBe(2);
    expect(navigation.sampleHeight(4, -1.5)).toBeGreaterThan(0);
    expect(navigation.sampleHeight(4, -1.5)).toBeLessThan(navigation.sampleHeight(4, 1.5));

    const path = navigation.findPath(4, -1.5, 4, 1.5);
    expect(path.some(([, y]) => y > 0 && y < 2)).toBe(true);
    expect(path[path.length - 1]?.[1]).toBe(2);
  });
});
