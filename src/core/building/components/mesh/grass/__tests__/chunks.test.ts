import type { TileConfig } from '../../../../types';
import { TILE_CONSTANTS } from '../../../../types/constants';
import { groupGrassChunks, groupGrassGrounds } from '../layers';

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

test('tiles whose mesh grows grass form lawn layers, covers keep their surface, and cells know their grass-bearing neighbors', () => {
  const lawn = { id: 'lawn', color: '#8ccd65', grass: { density: 12 } };
  const tile = (id: string, x: number, z: number, objectType?: TileConfig['objectType']): TileConfig => ({
    id, tileGroupId: 'g', position: { x, y: 0, z }, size: 1, materialId: 'lawn', ...(objectType ? { objectType } : {}),
  });
  const tiles = [tile('a', 0, 0), tile('b', cell, 0), tile('w', 0, cell, 'water'), tile('t', cell, cell, 'grass')];
  const chunks = groupGrassChunks(tiles, { meshOf: () => lawn, span: 4 });
  const lawns = chunks.filter((chunk) => chunk.profile === 'lawn');
  // Both lawn tiles and the tall-grass tile, which keeps a lawn under its tall blades; not the water.
  expect(lawns.flatMap((chunk) => chunk.cells)).toHaveLength(3);
  expect(lawns[0]!.density).toBe(12);
  expect(lawns[0]!.terrainColor).toBe('#8ccd65');
  // The tall-grass tile on a grass mesh keeps the mesh surface instead of the painted meadow.
  const tall = chunks.find((chunk) => chunk.profile === 'tall')!;
  expect(tall.painted).toBe(false);
  expect(groupGrassGrounds(tiles, () => lawn)).toHaveLength(0);
  // a (0,0) sees b to its east (bit 1) and not the water to its south (+z, bit 3).
  const a = lawns.flatMap((chunk) => chunk.cells.map((cellEntry) => [chunk.origin[0] + cellEntry[0], chunk.origin[2] + cellEntry[1], cellEntry[3]] as const))
    .find(([x, z]) => x === 0 && z === 0)!;
  expect(a[2]! & 2).toBe(2);
  expect(a[2]! & 8).toBe(0);
});
