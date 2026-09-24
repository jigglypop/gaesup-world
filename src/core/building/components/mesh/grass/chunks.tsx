import { memo, useMemo } from 'react';

import Grass from './Grass';
import type { TileConfig } from '../../../types';
import { TILE_CONSTANTS } from '../../../types/constants';

/** Tiles per chunk side. One chunk is one blade draw and one ground draw instead of two per tile. */
const CHUNK_TILES = 4;
const DEFAULT_DENSITY = 90;
const BLADE_LIFT = 0.05;

export type GrassChunk = {
  key: string;
  origin: [number, number, number];
  center: [number, number, number];
  cells: [number, number, number][];
  cellSize: number;
  width: number;
  density: number;
  terrainColor?: string;
  terrainAccentColor?: string;
};

/**
 * Groups grass tiles into square chunks keyed by position, tile size, density and colors. Keys depend only on
 * those values, so an edit rebuilds the one chunk it touches. Blade density per square meter is unchanged.
 */
export function groupGrassChunks(tiles: readonly TileConfig[]): GrassChunk[] {
  const chunks = new Map<string, GrassChunk>();
  for (const tile of tiles) {
    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
    const span = cellSize * CHUNK_TILES;
    const cx = Math.floor(tile.position.x / span);
    const cz = Math.floor(tile.position.z / span);
    const density = tile.objectConfig?.grassDensity ?? DEFAULT_DENSITY;
    const { terrainColor, terrainAccentColor } = tile.objectConfig ?? {};
    const key = `${cx}:${cz}:${cellSize}:${density}:${terrainColor ?? ''}:${terrainAccentColor ?? ''}`;
    let chunk = chunks.get(key);
    if (!chunk) {
      const origin: [number, number, number] = [(cx + 0.5) * span, BLADE_LIFT, (cz + 0.5) * span];
      chunk = {
        key, origin, center: [origin[0], 0, origin[2]], cells: [], cellSize, width: span, density,
        ...(terrainColor ? { terrainColor } : {}),
        ...(terrainAccentColor ? { terrainAccentColor } : {}),
      };
      chunks.set(key, chunk);
    }
    chunk.cells.push([tile.position.x - chunk.origin[0], tile.position.z - chunk.origin[2], tile.position.y]);
  }
  for (const chunk of chunks.values()) {
    chunk.center[1] = chunk.cells.reduce((sum, cell) => sum + cell[2], 0) / chunk.cells.length;
  }
  return [...chunks.values()];
}

export const GrassChunks = memo(function GrassChunks({ tiles }: { tiles: readonly TileConfig[] }) {
  const chunks = useMemo(() => groupGrassChunks(tiles), [tiles]);
  return (
    <>
      {chunks.map((chunk) => (
        <Grass
          key={chunk.key}
          position={chunk.origin}
          center={chunk.center}
          width={chunk.width}
          cells={chunk.cells}
          cellSize={chunk.cellSize}
          density={chunk.density}
          maxInstances={Math.ceil(chunk.density * chunk.cells.length * chunk.cellSize * chunk.cellSize)}
          {...(chunk.terrainColor ? { groundColor: chunk.terrainColor, bladeBottomColor: chunk.terrainColor } : {})}
          {...(chunk.terrainAccentColor ? { groundAccentColor: chunk.terrainAccentColor, bladeTipColor: chunk.terrainAccentColor } : {})}
        />
      ))}
    </>
  );
});
