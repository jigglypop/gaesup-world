import { TILE_CONSTANTS } from '../../types/constants';
import { createCellIndex } from '../cellIndex';

const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
const square = (x: number, z: number, size: number = cell) => ({ minX: x - size / 2, maxX: x + size / 2, minZ: z - size / 2, maxZ: z + size / 2 });

test('a point lookup returns the few items around it, whatever the item count', () => {
  const tiles = Array.from({ length: 2500 }, (_, i) => ({ id: i, ...square((i % 50) * cell, Math.floor(i / 50) * cell) }));
  const near = createCellIndex(tiles, (tile) => tile);
  for (const tile of tiles) {
    const x = (tile.minX + tile.maxX) / 2 + 0.3;
    const z = (tile.minZ + tile.maxZ) / 2 - 0.3;
    const candidates = near(x, z);
    expect(candidates.length).toBeLessThanOrEqual(4);
    expect(candidates).toContain(tile);
  }
  expect(near(-1000, -1000)).toEqual([]);
});

test('an item larger than a cell is found from every point inside it', () => {
  const big = { id: 'big', ...square(10, -6, cell * 3) };
  const near = createCellIndex([big], (item) => item);
  for (let x = big.minX + 0.01; x < big.maxX; x += 0.5) {
    for (let z = big.minZ + 0.01; z < big.maxZ; z += 0.5) expect(near(x, z)).toContain(big);
  }
});
