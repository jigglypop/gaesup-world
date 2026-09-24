import { NavigationSystem } from '../NavigationSystem';

jest.mock('../../wasm/loader', () => ({ loadCoreWasm: async () => null }));

afterEach(() => NavigationSystem.getInstance().dispose());

// Independent Dijkstra oracle: no heuristic or production frontier implementation.
function shortestCost(grid: number[], costs: number[], width: number): number {
  const distance = grid.map(() => Infinity);
  const visited = new Set<number>();
  distance[0] = 0;
  for (;;) {
    let current = -1;
    for (let i = 0; i < grid.length; i++) {
      if (!visited.has(i) && (current < 0 || distance[i]! < distance[current]!)) current = i;
    }
    if (current < 0 || distance[current] === Infinity) return Infinity;
    if (current === grid.length - 1) return distance[current]!;
    visited.add(current);
    const x = current % width;
    const z = Math.floor(current / width);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const nz = z + dz;
        if ((!dx && !dz) || nx < 0 || nz < 0 || nx >= width || nz >= width) continue;
        const next = nz * width + nx;
        if (!grid[next] || (dx && dz && (!grid[z * width + nx] || !grid[nz * width + x]))) continue;
        distance[next] = Math.min(distance[next]!, distance[current]! + (dx && dz ? 14 : 10) * costs[next]!);
      }
    }
  }
}

it.each([false, true])('preserves shortest valid paths on seeded grids (weighted=%s)', async (weighted) => {
  const width = 12;
  const navigation = NavigationSystem.getInstance({ cellSize: 1, worldMinX: 0, worldMinZ: 0, worldMaxX: width, worldMaxZ: width });
  await navigation.init();
  let seed = 1729;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let sample = 0; sample < 25; sample++) {
    const grid = Array.from({ length: width * width }, () => random() > 0.23 ? 1 : 0);
    const costs = grid.map(() => weighted ? 1 + Math.floor(random() * 8) : 1);
    grid[0] = grid[grid.length - 1] = 1;
    for (let i = 0; i < grid.length; i++) {
      const x = i % width + 0.5;
      const z = Math.floor(i / width) + 0.5;
      if (grid[i]) navigation.setWalkable(x, z, 1, 1);
      else navigation.setBlocked(x, z, 1, 1);
      navigation.setCost(x, z, costs[i]!);
    }
    const path = navigation.findPath(0.5, 0.5, width - 0.5, width - 0.5, { weighted });
    const expected = shortestCost(grid, costs, width);
    if (expected === Infinity) {
      expect(path).toEqual([]);
      continue;
    }
    expect(path[0]).toEqual([0.5, 0, 0.5]);
    expect(path[path.length - 1]).toEqual([width - 0.5, 0, width - 0.5]);
    let actual = 0;
    for (let i = 1; i < path.length; i++) {
      const [x, , z] = path[i]!;
      const [px, , pz] = path[i - 1]!;
      const dx = Math.abs(x - px);
      const dz = Math.abs(z - pz);
      expect(Math.max(dx, dz)).toBe(1);
      expect(grid[Math.floor(z) * width + Math.floor(x)]).toBe(1);
      if (dx && dz) {
        expect(grid[Math.floor(pz) * width + Math.floor(x)]).toBe(1);
        expect(grid[Math.floor(z) * width + Math.floor(px)]).toBe(1);
      }
      actual += (dx && dz ? 14 : 10) * costs[Math.floor(z) * width + Math.floor(x)]!;
    }
    expect(actual).toBe(expected);
  }
});
