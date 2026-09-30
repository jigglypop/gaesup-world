import type { TileConfig } from '../../types';
import { createTileSampler } from '../sampler';

const tile = (id: string, x: number, z: number, extra: Partial<TileConfig> = {}): TileConfig =>
  ({ id, position: { x, y: 0, z }, size: 1, ...extra }) as TileConfig;

describe('createTileSampler', () => {
  const tiles = [
    tile('lawn', 2, 2),
    tile('pond', 6, 2, { objectType: 'water' }),
    tile('big', 8, 12, { size: 2, materialId: 'planks' }),
    tile('raised', 10, 14, { position: { x: 10, y: 1, z: 14 } }),
  ];
  const sampler = createTileSampler({ tileGroups: [{ tiles, floorMeshId: 'grass' }] });

  it('finds the tile under a point, with the material it draws with', () => {
    expect(sampler.at(1, 3)?.tile.id).toBe('lawn');
    expect(sampler.at(1, 3)?.materialId).toBe('grass');
    expect(sampler.at(5.5, 1)?.tile.id).toBe('pond');
    expect(sampler.at(20, 20)).toBeNull();
  });

  it('covers every cell of a large tile and prefers the highest where tiles stack', () => {
    expect(sampler.at(4.5, 8.5)?.tile.id).toBe('big');
    expect(sampler.at(4.5, 8.5)?.materialId).toBe('planks');
    expect(sampler.at(11, 15)?.tile.id).toBe('raised');
    expect(sampler.heightAt(11, 15)).toBe(1);
    expect(sampler.heightAt(7, 9)).toBe(0);
    expect(sampler.heightAt(40, 40, -2)).toBe(-2);
  });

  it('reads water from water tiles, and off the tiles from the world surface', () => {
    expect(sampler.isWater(6, 2)).toBe(true);
    expect(sampler.isWater(2, 2)).toBe(false);
    expect(sampler.isWater(40, 40)).toBe(false);
    expect(createTileSampler({ tileGroups: [{ tiles, floorMeshId: 'grass' }], worldSurface: 'water' }).isWater(40, 40)).toBe(true);
  });
});
