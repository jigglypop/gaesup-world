import { memo, useEffect, useMemo } from 'react';

import Grass, { createGrassGround, getGrassGroundMaterial } from './Grass';
import { getDefaultToonMode } from '../../../../rendering/toon';
import type { TileConfig } from '../../../types';
import { TILE_CONSTANTS } from '../../../types/constants';

/**
 * Tiles per blade chunk side. Blades are one draw per chunk (LOD and culling stay per chunk); ground has no LOD,
 * so each color set is a single draw for the whole group.
 */
const CHUNK_TILES = 8;
const DEFAULT_DENSITY = 90;
const BLADE_LIFT = 0.05;

type Cell = [number, number, number];

export type GrassChunk = {
  key: string;
  origin: [number, number, number];
  center: [number, number, number];
  cells: Cell[];
  cellSize: number;
  width: number;
  density: number;
  terrainColor?: string;
  terrainAccentColor?: string;
};

export type GrassGround = {
  key: string;
  origin: [number, number, number];
  cells: Cell[];
  cellSize: number;
  terrainColor?: string;
  terrainAccentColor?: string;
};

function colorKey(tile: TileConfig): string {
  return `${tile.objectConfig?.terrainColor ?? ''}:${tile.objectConfig?.terrainAccentColor ?? ''}`;
}

function colors(tile: TileConfig): { terrainColor?: string; terrainAccentColor?: string } {
  const { terrainColor, terrainAccentColor } = tile.objectConfig ?? {};
  return { ...(terrainColor ? { terrainColor } : {}), ...(terrainAccentColor ? { terrainAccentColor } : {}) };
}

/**
 * Groups grass tiles into square blade chunks keyed by position, tile size, density and colors. Keys depend only
 * on those values, so an edit rebuilds the one chunk it touches. Blade density per square meter is unchanged.
 */
export function groupGrassChunks(tiles: readonly TileConfig[]): GrassChunk[] {
  const chunks = new Map<string, GrassChunk>();
  for (const tile of tiles) {
    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
    const span = cellSize * CHUNK_TILES;
    const cx = Math.floor(tile.position.x / span);
    const cz = Math.floor(tile.position.z / span);
    const density = tile.objectConfig?.grassDensity ?? DEFAULT_DENSITY;
    const key = `${cx}:${cz}:${cellSize}:${density}:${colorKey(tile)}`;
    let chunk = chunks.get(key);
    if (!chunk) {
      const origin: [number, number, number] = [(cx + 0.5) * span, BLADE_LIFT, (cz + 0.5) * span];
      chunk = { key, origin, center: [origin[0], 0, origin[2]], cells: [], cellSize, width: span, density, ...colors(tile) };
      chunks.set(key, chunk);
    }
    chunk.cells.push([tile.position.x - chunk.origin[0], tile.position.z - chunk.origin[2], tile.position.y]);
  }
  for (const chunk of chunks.values()) {
    chunk.center[1] = chunk.cells.reduce((sum, cell) => sum + cell[2], 0) / chunk.cells.length;
  }
  return [...chunks.values()];
}

/** One ground per tile size and color set; cells are relative to the first tile of the set. */
export function groupGrassGrounds(tiles: readonly TileConfig[]): GrassGround[] {
  const grounds = new Map<string, GrassGround>();
  for (const tile of tiles) {
    const cellSize = TILE_CONSTANTS.GRID_CELL_SIZE * (tile.size || 1);
    const key = `${cellSize}:${colorKey(tile)}`;
    let ground = grounds.get(key);
    if (!ground) {
      ground = { key, origin: [tile.position.x, BLADE_LIFT, tile.position.z], cells: [], cellSize, ...colors(tile) };
      grounds.set(key, ground);
    }
    ground.cells.push([tile.position.x - ground.origin[0], tile.position.z - ground.origin[2], tile.position.y]);
  }
  return [...grounds.values()];
}

const GrassGroundMesh = memo(function GrassGroundMesh({ ground }: { ground: GrassGround }) {
  const geometry = useMemo(
    () => createGrassGround(ground.cells, ground.cellSize, ground.terrainColor, ground.terrainAccentColor),
    [ground],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={ground.origin} geometry={geometry} material={getGrassGroundMaterial(getDefaultToonMode())} receiveShadow />;
});

export const GrassChunks = memo(function GrassChunks({ tiles }: { tiles: readonly TileConfig[] }) {
  const chunks = useMemo(() => groupGrassChunks(tiles), [tiles]);
  const grounds = useMemo(() => groupGrassGrounds(tiles), [tiles]);
  return (
    <>
      {grounds.map((ground) => <GrassGroundMesh key={ground.key} ground={ground} />)}
      {chunks.map((chunk) => (
        <Grass
          key={chunk.key}
          ground={false}
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
