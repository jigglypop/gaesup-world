import { tileWorldSize } from '../model/footprint';
import type { BuildingWorldSurface, TileConfig, TileGroupConfig } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

const CELL = TILE_CONSTANTS.GRID_CELL_SIZE;
/** Bucket indices fold into one number; ±32k buckets of 4 m reach 130 km from the origin. */
const SPAN = 65_536;
const HALF = SPAN / 2;

export type TileSamplerSource = {
  tileGroups: Iterable<Pick<TileGroupConfig, 'tiles' | 'floorMeshId'>>;
  /** `water`: points off the tiles are open sea. */
  worldSurface?: BuildingWorldSurface;
};

export type TileSample = {
  tile: TileConfig;
  /** The mesh config the tile draws with: its own, or its group's floor. */
  materialId: string;
  /** World height of the tile's top. */
  height: number;
};

export type TileSampler = {
  /** The tile at world (x, z), the highest where tiles stack; null off the tiles. */
  at(x: number, z: number): TileSample | null;
  /** The top of the ground at (x, z), or `fallback` off the tiles. */
  heightAt(x: number, z: number, fallback?: number): number;
  /** A water tile, or open sea off the tiles when the world surface is water. */
  isWater(x: number, z: number): boolean;
};

const bucket = (value: number): number => Math.floor(value / CELL);
const key = (x: number, z: number): number => (x + HALF) * SPAN + (z + HALF);

/**
 * Answers what the ground is at a world point (tile, material, height, water) in constant time, from the same source as
 * the shore field. Build one per tile edit: a thousand tiles take well under a millisecond.
 */
export function createTileSampler({ tileGroups, worldSurface = 'ground' }: TileSamplerSource): TileSampler {
  const buckets = new Map<number, TileSample[]>();
  for (const group of tileGroups) {
    for (const tile of group.tiles) {
      const half = tileWorldSize(tile) / 2;
      const sample: TileSample = { tile, materialId: tile.materialId ?? group.floorMeshId, height: tile.position.y };
      const { x, z } = tile.position;
      // A tile's far edges belong to the next bucket's cells only past its span.
      for (let bx = bucket(x - half); bx <= bucket(x + half - 1e-6); bx++) {
        for (let bz = bucket(z - half); bz <= bucket(z + half - 1e-6); bz++) {
          const found = buckets.get(key(bx, bz));
          if (found) found.push(sample);
          else buckets.set(key(bx, bz), [sample]);
        }
      }
    }
  }
  const at = (x: number, z: number): TileSample | null => {
    let best: TileSample | null = null;
    for (const sample of buckets.get(key(bucket(x), bucket(z))) ?? []) {
      const half = tileWorldSize(sample.tile) / 2;
      if (Math.abs(sample.tile.position.x - x) > half || Math.abs(sample.tile.position.z - z) > half) continue;
      if (!best || sample.height > best.height) best = sample;
    }
    return best;
  };
  return {
    at,
    heightAt: (x, z, fallback = 0) => at(x, z)?.height ?? fallback,
    isWater: (x, z) => {
      const sample = at(x, z);
      return sample ? sample.tile.objectType === 'water' : worldSurface === 'water';
    },
  };
}
