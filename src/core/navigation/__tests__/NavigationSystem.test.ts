import { NavigationSystem } from '../NavigationSystem';
import type { GaesupCoreWasmExports } from '../../wasm/loader';

type MockWasm = GaesupCoreWasmExports & {
  astar_find_path: jest.MockedFunction<GaesupCoreWasmExports['astar_find_path']>;
  astar_find_path_weighted: jest.MockedFunction<GaesupCoreWasmExports['astar_find_path_weighted']>;
};

let mockWasm: MockWasm | null = null;

jest.mock('../../wasm/loader', () => ({
  loadCoreWasm: jest.fn(async () => mockWasm),
}));

const TEST_CONFIG = {
  cellSize: 1,
  worldMinX: 0,
  worldMinZ: 0,
  worldMaxX: 6,
  worldMaxZ: 6,
  maxStepHeight: 0.75,
};

function createNavigation(config = TEST_CONFIG): NavigationSystem {
  return NavigationSystem.getInstance(config);
}

function createMockWasm(options: { omitWeighted?: boolean } = {}): MockWasm {
  const memory = new WebAssembly.Memory({ initial: 1 });
  let nextPtr = 8;
  const alloc = (bytes: number): number => {
    const ptr = nextPtr;
    nextPtr += bytes;
    return ptr;
  };
  const writePath = (outPathPtr: number, points: Array<[number, number]>): number => {
    const out = new Uint32Array(memory.buffer, outPathPtr, points.length * 2);
    points.forEach(([x, z], index) => {
      out[index * 2] = x;
      out[index * 2 + 1] = z;
    });
    return points.length;
  };

  const wasm: MockWasm = {
    memory,
    alloc_f32: jest.fn((len) => alloc(len * Float32Array.BYTES_PER_ELEMENT)),
    dealloc_f32: jest.fn(),
    alloc_u8: jest.fn((len) => alloc(len)),
    dealloc_u8: jest.fn(),
    alloc_u32: jest.fn((len) => alloc(len * Uint32Array.BYTES_PER_ELEMENT)),
    dealloc_u32: jest.fn(),
    fill_grass_data: jest.fn(),
    fill_terrain_y: jest.fn(),
    fill_instance_matrices: jest.fn(),
    fill_wall_matrices: jest.fn(),
    batch_smooth_damp: jest.fn(),
    batch_quat_slerp: jest.fn(),
    batch_sfe_weights: jest.fn(),
    spatial_query_nearby: jest.fn(),
    spatial_grid_query: jest.fn(),
    update_snow_particles: jest.fn(),
    update_fire_particles: jest.fn(),
    astar_find_path: jest.fn((
      _gridPtr,
      _gridWidth,
      _gridHeight,
      startX,
      startZ,
      goalX,
      goalZ,
      outPathPtr,
    ) => writePath(outPathPtr, [[startX, startZ], [goalX, goalZ]])),
    astar_find_path_weighted: jest.fn((
      _costPtr,
      _gridWidth,
      _gridHeight,
      startX,
      startZ,
      goalX,
      goalZ,
      outPathPtr,
    ) => writePath(outPathPtr, [[startX, startZ], [0, 1], [goalX, goalZ]])),
  };

  if (options.omitWeighted) {
    delete (wasm as Partial<MockWasm>).astar_find_path_weighted;
  }

  return wasm;
}

afterEach(() => {
  NavigationSystem.getInstance().dispose();
  mockWasm = null;
});

describe('NavigationSystem', () => {
  it('converts between world and grid coordinates with bounds clamping', () => {
    const navigation = createNavigation();

    expect(navigation.worldToGrid(2.4, 3.8)).toEqual([2, 3]);
    expect(navigation.worldToGrid(-100, 100)).toEqual([0, 5]);
    expect(navigation.gridToWorld(2, 3, 1.5)).toEqual([2.5, 1.5, 3.5]);
    expect(navigation.getGridDimensions()).toEqual({ width: 6, height: 6, cellSize: 1 });
  });

  it('returns no path before initialization and finds a path after init', async () => {
    const navigation = createNavigation();

    expect(navigation.findPath(0.5, 0.5, 3.5, 0.5)).toEqual([]);

    await navigation.init();

    const path = navigation.findPath(0.5, 0.5, 3.5, 0.5);
    expect(path[0]).toEqual([0.5, 0, 0.5]);
    expect(path[path.length - 1]).toEqual([3.5, 0, 0.5]);
  });

  it('returns no path when the start or goal cell is blocked', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(0.5, 0.5, 1, 1);
    expect(navigation.findPath(0.5, 0.5, 3.5, 0.5)).toEqual([]);

    navigation.setWalkable(0.5, 0.5, 1, 1);
    navigation.setBlocked(3.5, 0.5, 1, 1);
    expect(navigation.findPath(0.5, 0.5, 3.5, 0.5)).toEqual([]);
  });

  it('routes around blocked regions through an available gap', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(2.5, 0.5, 1, 1);
    navigation.setBlocked(2.5, 1.5, 1, 1);
    navigation.setBlocked(2.5, 3.5, 1, 1);
    navigation.setBlocked(2.5, 4.5, 1, 1);

    const path = navigation.findPath(0.5, 2.5, 5.5, 2.5);

    expect(path.length).toBeGreaterThan(0);
    expect(path).toContainEqual([2.5, 0, 2.5]);
    expect(path.some(([x, , z]) => x === 2.5 && z !== 2.5)).toBe(false);
  });

  it('rejects gaps that are too narrow for the agent footprint', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(2.5, 0.5, 1, 1);
    navigation.setBlocked(2.5, 1.5, 1, 1);
    navigation.setBlocked(2.5, 3.5, 1, 1);
    navigation.setBlocked(2.5, 4.5, 1, 1);
    navigation.setBlocked(2.5, 5.5, 1, 1);

    const smallAgent = navigation.findPath(0.5, 2.5, 5.5, 2.5, { agentRadius: 0.49 });
    const largeAgent = navigation.findPath(0.5, 2.5, 5.5, 2.5, { agentRadius: 0.51 });

    expect(smallAgent).toContainEqual([2.5, 0, 2.5]);
    expect(largeAgent).toEqual([]);
  });

  it('prevents diagonal corner cutting between blocked cells', async () => {
    const navigation = createNavigation({
      cellSize: 1,
      worldMinX: 0,
      worldMinZ: 0,
      worldMaxX: 2,
      worldMaxZ: 2,
    });
    await navigation.init();

    navigation.setBlocked(1.5, 0.5, 1, 1);
    navigation.setBlocked(0.5, 1.5, 1, 1);

    expect(navigation.findPath(0.5, 0.5, 1.5, 1.5)).toEqual([]);
  });

  it('uses cost values in the JavaScript weighted fallback', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setCost(1.5, 0.5, 50);
    navigation.setCost(2.5, 0.5, 50);
    navigation.setCost(3.5, 0.5, 50);

    const unweighted = navigation.findPath(0.5, 0.5, 4.5, 0.5);
    const weighted = navigation.findPath(0.5, 0.5, 4.5, 0.5, 0, true);

    expect(unweighted).toContainEqual([2.5, 0, 0.5]);
    expect(weighted.some(([x, , z]) => z === 0.5 && x > 0.5 && x < 4.5)).toBe(false);
  });

  it('uses WASM pathfinding when the core module is available', async () => {
    mockWasm = createMockWasm();
    const navigation = createNavigation();

    await navigation.init();

    const path = navigation.findPath(0.5, 0.5, 4.5, 0.5, 2);

    expect(mockWasm.astar_find_path).toHaveBeenCalledTimes(1);
    expect(mockWasm.astar_find_path_weighted).not.toHaveBeenCalled();
    expect(path).toEqual([
      [0.5, 2, 0.5],
      [4.5, 2, 0.5],
    ]);
  });

  it('syncs the cost grid before weighted WASM pathfinding', async () => {
    mockWasm = createMockWasm();
    const navigation = createNavigation();

    await navigation.init();
    navigation.setCost(1.5, 0.5, 50);

    const path = navigation.findPath(0.5, 0.5, 4.5, 0.5, 0, true);
    const [costPtr, gridWidth, gridHeight] = mockWasm.astar_find_path_weighted.mock.calls[0] ?? [];

    expect(costPtr).toEqual(expect.any(Number));
    expect(gridWidth).toBe(6);
    expect(gridHeight).toBe(6);
    expect(new Uint8Array(mockWasm.memory.buffer, costPtr, gridWidth * gridHeight)[1]).toBe(50);
    expect(path).toEqual([
      [0.5, 0, 0.5],
      [0.5, 0, 1.5],
      [4.5, 0, 0.5],
    ]);
  });

  it('falls back to JavaScript weighted pathfinding when WASM lacks the weighted export', async () => {
    mockWasm = createMockWasm({ omitWeighted: true });
    const navigation = createNavigation();

    await navigation.init();
    navigation.setCost(1.5, 0.5, 50);
    navigation.setCost(2.5, 0.5, 50);
    navigation.setCost(3.5, 0.5, 50);

    const path = navigation.findPath(0.5, 0.5, 4.5, 0.5, 0, true);

    expect(mockWasm.astar_find_path).not.toHaveBeenCalled();
    expect(path.some(([x, , z]) => z === 0.5 && x > 0.5 && x < 4.5)).toBe(false);
  });

  it('simplifies collinear path segments', () => {
    const navigation = createNavigation();

    expect(navigation.simplifyPath([
      [0.5, 0, 0.5],
      [1.5, 0, 0.5],
      [2.5, 0, 0.5],
      [2.5, 0, 1.5],
    ])).toEqual([
      [0.5, 0, 0.5],
      [2.5, 0, 0.5],
      [2.5, 0, 1.5],
    ]);
  });

  it('reports line of sight only when no blocked cell intersects the segment', async () => {
    const navigation = createNavigation();
    await navigation.init();

    expect(navigation.hasLineOfSight(0.5, 0.5, 5.5, 0.5)).toBe(true);

    navigation.setBlocked(2.5, 0.5, 1, 1);

    expect(navigation.hasLineOfSight(0.5, 0.5, 5.5, 0.5)).toBe(false);
    expect(navigation.hasLineOfSight(0.5, 0.5, 0.5, 5.5)).toBe(true);
  });

  it('checks line of sight with the agent footprint, not just the center point', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(2.5, 1.5, 1, 1);

    expect(navigation.hasLineOfSight(0.5, 0.5, 4.5, 0.5)).toBe(true);
    expect(navigation.hasLineOfSight(0.5, 0.5, 4.5, 0.5, { agentRadius: 0.51 })).toBe(false);
  });

  it('smooths a grid route using visible corners while preserving exact endpoints', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(2.5, 2.5, 1, 1);

    const raw = navigation.findPath(0.2, 2.2, 5.8, 2.2);
    const smooth = navigation.smoothPath(raw, [0.2, 0, 2.2], [5.8, 0, 2.2]);

    expect(smooth[0]).toEqual([0.2, 0, 2.2]);
    expect(smooth[smooth.length - 1]).toEqual([5.8, 0, 2.2]);
    expect(smooth.length).toBeLessThan(raw.length);
    expect(smooth.length).toBeGreaterThan(2);
    expect(smooth).not.toContainEqual([2.5, 0, 2.5]);
  });

  it('does not treat tall height jumps as directly walkable', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setHeightRegion(3.5, 2.5, 3, 6, 2);

    expect(navigation.hasLineOfSight(0.5, 0.5, 5.5, 0.5)).toBe(false);
    expect(navigation.findPath(0.5, 0.5, 5.5, 0.5)).toEqual([]);
  });

  it('checks short forward movement segments against blocked and tall cells', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setBlocked(1.5, 0.5, 1, 1);
    expect(navigation.canTraverseSegment(0.5, 0.5, 1.5, 0.5)).toBe(false);

    navigation.setWalkable(1.5, 0.5, 1, 1);
    navigation.setHeight(1.5, 0.5, 2);
    expect(navigation.canTraverseSegment(0.5, 0.5, 1.5, 0.5)).toBe(false);
  });

  it('allows gradual height changes within the configured step height', async () => {
    const navigation = createNavigation();
    await navigation.init();

    navigation.setHeight(1.5, 0.5, 0.5);
    navigation.setHeight(2.5, 0.5, 1);
    navigation.setHeight(3.5, 0.5, 1.5);
    navigation.setHeight(4.5, 0.5, 2);

    const path = navigation.findPath(0.5, 0.5, 4.5, 0.5);

    expect(path.map(([, y]) => y)).toEqual([0, 0.5, 1, 1.5, 2]);
  });
});
