import { placeGrassOnCells } from '../cells';

test('a single grass batch fills only selected cells and LOD prefixes cover every cell', () => {
  const cells = [[-3.5, 2.5], [4.5, -5.5], [6.5, 7.5]] as const;
  const offsets = new Float32Array(900);
  placeGrassOnCells(offsets, cells, 1);
  for (let blade = 0; blade < 300; blade++) {
    const [x, z] = cells[blade % cells.length]!;
    expect(Math.abs(offsets[blade * 3]! - x)).toBeLessThan(0.46);
    expect(Math.abs(offsets[blade * 3 + 2]! - z)).toBeLessThan(0.46);
    expect(offsets[blade * 3 + 1]).toBe(0);
  }
  const expanded = new Float32Array(1200);
  placeGrassOnCells(expanded, [...cells, [12.5, 12.5]], 1);
  // A cell's blades stay put when another tile is added to the batch.
  for (let blade = 0; blade < 100; blade++) {
    expect(Array.from(expanded.slice(blade * 12, blade * 12 + 3))).toEqual(Array.from(offsets.slice(blade * 9, blade * 9 + 3)));
  }
  const empty = new Float32Array(0); expect(() => placeGrassOnCells(empty, [], 1)).not.toThrow();
});
