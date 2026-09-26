import type { BuildingBlockConfig, TileConfig, WallConfig } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

const { GRID_CELL_SIZE: CELL, HEIGHT_STEP } = TILE_CONSTANTS;

/**
 * The space a building piece takes in the world: rendering, colliders, navigation and visibility all read it,
 * so a wall is solid, blocked and drawn in one place.
 */
export type BuildingBox = {
  center: readonly [number, number, number];
  /** Half extents along the box's own axes, before `rotationY`. */
  half: readonly [number, number, number];
  rotationY: number;
};

export type BoundsXZ = { minX: number; maxX: number; minZ: number; maxZ: number };

/** Quarter turns give exact 0 and ±1, so axis-aligned bounds land on cell lines instead of 1e-16 past them. */
const exact = (value: number): number => (Math.abs(value) < 1e-9 ? 0 : value);

/** Whole cells a size field stands for. */
export const cellSpan = (size: number | undefined): number => Math.max(1, Math.round(size || 1));

/** A tile is a square `cellSpan(size)` cells wide. */
export const tileWorldSize = (tile: Pick<TileConfig, 'size'>): number => cellSpan(tile.size) * CELL;

/** A wall's length runs along its local X, half a length along its local Z from the pivot at `position`. */
export function wallBox(wall: Pick<WallConfig, 'position' | 'rotation'>): BuildingBox {
  const { WIDTH, HEIGHT, THICKNESS } = TILE_CONSTANTS.WALL_SIZES;
  const rotationY = wall.rotation.y;
  return {
    center: [
      wall.position.x + exact(Math.sin(rotationY)) * WIDTH / 2,
      wall.position.y + HEIGHT / 2,
      wall.position.z + exact(Math.cos(rotationY)) * WIDTH / 2,
    ],
    half: [WIDTH / 2, HEIGHT / 2, THICKNESS / 2],
    rotationY,
  };
}

/** A block fills whole cells from the cell centered on `position` toward +X, +Y and +Z. */
export function blockBox(block: Pick<BuildingBlockConfig, 'position' | 'size'>): BuildingBox {
  const width = cellSpan(block.size?.x) * CELL;
  const height = cellSpan(block.size?.y) * HEIGHT_STEP;
  const depth = cellSpan(block.size?.z) * CELL;
  return {
    center: [
      block.position.x + (width - CELL) / 2,
      block.position.y + height / 2,
      block.position.z + (depth - CELL) / 2,
    ],
    half: [width / 2, height / 2, depth / 2],
    rotationY: 0,
  };
}

/** A tile is centered on `position` and reaches from the ground to its top. */
export function tileBox(tile: Pick<TileConfig, 'position' | 'size' | 'rotation'>): BuildingBox {
  const half = tileWorldSize(tile) / 2;
  const top = Math.max(tile.position.y, 0);
  return {
    center: [tile.position.x, top / 2, tile.position.z],
    half: [half, top / 2, half],
    rotationY: tile.rotation ?? 0,
  };
}

/** World-space XZ bounds of a box after its turn. */
export function boxBoundsXZ({ center, half, rotationY }: BuildingBox): BoundsXZ {
  const cos = Math.abs(exact(Math.cos(rotationY)));
  const sin = Math.abs(exact(Math.sin(rotationY)));
  const halfX = half[0] * cos + half[2] * sin;
  const halfZ = half[0] * sin + half[2] * cos;
  return { minX: center[0] - halfX, maxX: center[0] + halfX, minZ: center[2] - halfZ, maxZ: center[2] + halfZ };
}
