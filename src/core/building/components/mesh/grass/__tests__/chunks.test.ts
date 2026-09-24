import type { TileConfig } from '../../../../types';
import { TILE_CONSTANTS } from '../../../../types/constants';
import { groupGrassChunks, groupGrassGrounds } from '../chunks';

jest.mock('../Grass', () => ({ __esModule: true, default: () => null, createGrassGround: jest.fn(), getGrassGroundMaterial: jest.fn() }));

const cell = TILE_CONSTANTS.GRID_CELL_SIZE;
const grass = (id: string, x: number, z: number, config?: TileConfig['objectConfig'], y = 0): TileConfig => ({
  id, tileGroupId: 'g', position: { x, y, z }, size: 1, objectType: 'grass', ...(config ? { objectConfig: config } : {}),
});

test('grass tiles group into 8x8-tile chunks with local cells and unchanged density', () => {
  const tiles = Array.from({ length: 256 }, (_, i) => grass(`t${i}`, (i % 16) * cell + cell / 2, Math.floor(i / 16) * cell + cell / 2));
  const chunks = groupGrassChunks(tiles);
  expect(chunks).toHaveLength(4);
  for (const chunk of chunks) {
    expect(chunk.cells).toHaveLength(64);
    expect(chunk.density).toBe(90);
    for (const [x, z] of chunk.cells) {
      expect(Math.abs(x)).toBeLessThan(chunk.width / 2);
      expect(Math.abs(z)).toBeLessThan(chunk.width / 2);
    }
  }
  const [first] = chunks;
  expect(first!.cells[0]![0] + first!.origin[0]).toBe(tiles[0]!.position.x);
});

test('density, colors and height stay per chunk and keys ignore tile ids', () => {
  const chunks = groupGrassChunks([
    grass('a', 2, 2), grass('b', 6, 2, { grassDensity: 40 }), grass('c', 10, 2, { terrainColor: '#112233' }, 1),
  ]);
  expect(chunks.map((chunk) => chunk.density).sort()).toEqual([40, 90, 90]);
  expect(chunks.find((chunk) => chunk.terrainColor === '#112233')?.cells[0]?.[2]).toBe(1);
  expect(groupGrassChunks([grass('renamed', 2, 2)])[0]?.key).toBe(chunks.find((chunk) => chunk.density === 90 && !chunk.terrainColor)?.key);
});

test('ground is one geometry per tile size and color set for the whole group', () => {
  const grounds = groupGrassGrounds([
    grass('a', 2, 2), grass('b', 400, 2), grass('c', 6, 2, { terrainColor: '#112233' }),
  ]);
  expect(grounds).toHaveLength(2);
  const plain = grounds.find((ground) => !ground.terrainColor)!;
  expect(plain.cells).toEqual([[0, 0, 0], [398, 0, 0]]);
  expect(plain.origin).toEqual([2, 0.05, 2]);
});
