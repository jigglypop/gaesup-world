import * as THREE from 'three';

import { borderDistance } from '../../../../terrain/grid';
import { drawCount, GrassBudget, lodWeight, tierIndex } from '../budget';
import { buildGrassLayout, createGrassLayoutBuild, withNeighborMasks, type GrassLayoutInput } from '../field';

const input = (overrides: Partial<GrassLayoutInput> = {}): GrassLayoutInput => ({
  profile: 'lawn',
  cells: withNeighborMasks([[0, 0], [4, 0], [0, 4], [4, 4]], 4),
  cellSize: 4,
  originX: 10,
  originZ: -6,
  density: 16,
  heightScale: 1,
  surface: { color: new THREE.Color('#86c460') },
  maxBlades: Infinity,
  ...overrides,
});

test('a layout is the same on every build and for every client', () => {
  const a = buildGrassLayout(input());
  const b = buildGrassLayout(input());
  expect(a.count).toBeGreaterThan(0);
  expect(Array.from(a.offsets)).toEqual(Array.from(b.offsets));
  expect(Array.from(a.shapes)).toEqual(Array.from(b.shapes));
});

test('any prefix of the blades a budget draws covers every cell', () => {
  const layout = buildGrassLayout(input());
  const prefix = Math.ceil(layout.count * 0.1);
  const seen = new Set<string>();
  for (let blade = 0; blade < prefix; blade++) {
    const x = layout.offsets[blade * 4]!, z = layout.offsets[blade * 4 + 2]!;
    seen.add(`${Math.round(x / 4)}:${Math.round(z / 4)}`);
  }
  expect(seen.size).toBe(4);
  // Draw rank rises through the list, which the shader's distance fade reads.
  expect(layout.offsets[3]).toBe(0);
  expect(layout.offsets[(layout.count - 1) * 4 + 3]).toBeLessThan(1);
});

test('the border wanders into the grass instead of following the cells, and never crosses them', () => {
  const layout = buildGrassLayout(input({ profile: 'tall', density: 52 }));
  const edge = (x: number, z: number) => Math.min(x + 2, 6 - x, z + 2, 6 - z);
  let nearEdge = 0;
  for (let blade = 0; blade < layout.count; blade++) {
    const x = layout.offsets[blade * 4]!, z = layout.offsets[blade * 4 + 2]!;
    expect(edge(x, z)).toBeGreaterThanOrEqual(0);
    if (edge(x, z) < 0.3) nearEdge++;
  }
  // Candidates fill the cells evenly; a ragged border leaves the outer 0.3 m nearly bare.
  expect(nearEdge / layout.count).toBeLessThan(0.02);
  // Inner edges between grass-bearing cells do not thin at all.
  expect(borderDistance(0xff, 1.9, 1.9, 4)).toBe(Infinity);
});

test('a build spread over frames lands on the same layout as one built at once', () => {
  const build = createGrassLayoutBuild(input());
  let steps = 0;
  while (!build.step(performance.now() - 1)) steps++;
  expect(steps).toBeGreaterThan(0);
  expect(Array.from(build.layout!.offsets)).toEqual(Array.from(buildGrassLayout(input()).offsets));
});

test('a blade cap keeps an evenly spread prefix', () => {
  const capped = buildGrassLayout(input({ maxBlades: 100 }));
  expect(capped.count).toBe(100);
});

test('distance thinning, joint tiers and the world budget', () => {
  const curve = { near: 22, far: 60, strength: 1.35 };
  expect(lodWeight(10, curve)).toBe(1);
  expect(lodWeight(60, curve)).toBe(0);
  expect(lodWeight(41, curve)).toBeGreaterThan(0);
  expect(lodWeight(41, curve)).toBeLessThan(0.5);
  expect([tierIndex(5), tierIndex(20), tierIndex(80)]).toEqual([0, 1, 2]);
  expect(drawCount(1000, 0.5, 1, 0.18)).toBe(590);
  expect(drawCount(1000, 0, 1, 0.18)).toBe(0);

  const budget = new GrassBudget();
  budget.max = 1000;
  const a = {}, b = {};
  budget.request(a, 900);
  budget.request(b, 900);
  expect(budget.scaleAt(1)).toBeCloseTo(1000 / 1800);
  budget.release(b);
  expect(budget.scaleAt(2)).toBe(1);
});
