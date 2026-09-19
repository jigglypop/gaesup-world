import { Vector3 } from 'three';

import { SpatialGrid } from '../SpatialGrid';

it('matches a brute-force sphere query across signed cell boundaries and reuses output', () => {
  const grid = new SpatialGrid({ cellSize: 10 });
  const objects = new Map<string, Vector3>();
  for (const x of [-20, -10.001, -10, -0.001, 0, 9.999, 10, 20]) {
    for (const z of [-10, 0, 10]) {
      for (const y of [0, 3]) {
        const id = `${x},${y},${z}`;
        const position = new Vector3(x, y, z);
        objects.set(id, position);
        grid.add(id, position);
      }
    }
  }
  const output = ['stale'];
  for (const x of [-10.001, -10, -0.001, 0, 9.999, 10]) {
    const center = new Vector3(x, 0, 0);
    for (const radius of [0, 0.001, 2, 10, 10.001, 35]) {
      const expected = [...objects].filter(([, position]) => position.distanceToSquared(center) <= radius * radius).map(([id]) => id).sort();
      expect(grid.getNearby(center, radius, output)).toBe(output);
      expect([...output].sort()).toEqual(expected);
    }
  }
});
