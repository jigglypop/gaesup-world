import type { EdgeCoord } from '../../grid';
import type { BuildingBlockConfig, BuildingWallKind, TileConfig, WallConfig, WallGroupConfig } from '../types';
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

/**
 * The grid edge a wall stands on, named one way only: the north side of a cell for a wall along X, the west side
 * for a wall along Z. Walls facing opposite ways on one line get the same edge.
 */
export function wallEdge(wall: Pick<WallConfig, 'position' | 'rotation'>): EdgeCoord {
  const { center } = wallBox(wall);
  const cell = (value: number): number => Math.round(value / CELL) || 0;
  const level = Math.round(wall.position.y / HEIGHT_STEP) || 0;
  return Math.abs(Math.cos(wall.rotation.y)) > Math.SQRT1_2
    ? { x: cell(center[0]), z: cell(center[2] + CELL / 2), level, side: 'north' }
    : { x: cell(center[0] + CELL / 2), z: cell(center[2]), level, side: 'west' };
}

/**
 * Odd-size tiles sit on a cell center and even-size tiles on a grid corner, so a tile's edges run along grid lines
 * and it covers whole cells. Half steps round down: an even tile moved off a cell center keeps the cells it had.
 */
export function snapTilePosition<T extends { x: number; z: number }>(position: T, size: number | undefined): T {
  const offset = cellSpan(size) % 2 === 0 ? CELL / 2 : 0;
  const snap = (value: number): number => Math.ceil((value - offset) / CELL - 0.5) * CELL + offset;
  return { ...position, x: snap(position.x), z: snap(position.z) };
}

export const wallKindOf =(wall: Pick<WallConfig, 'wallKind'>, group?: Pick<WallGroupConfig, 'defaultWallKind'>): BuildingWallKind =>
  wall.wallKind ?? group?.defaultWallKind ?? 'solid';

/** A wall part in the wall's frame: x along the wall from its center, y up from its base, z across it. */
export type WallPiece = {
  key: string;
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  /** A door leaf is drawn but walked through; frames and glass stop bodies. */
  role: 'frame' | 'glass' | 'door';
};

/** The parts each kind of wall is built from, shared by its mesh and its colliders. */
export function wallPieces(kind: BuildingWallKind): WallPiece[] {
  const { WIDTH: w, HEIGHT: h, THICKNESS: d } = TILE_CONSTANTS.WALL_SIZES;
  const frame = (key: string, position: WallPiece['position'], size: WallPiece['size']): WallPiece => ({ key, position, size, role: 'frame' });
  switch (kind) {
    case 'solid':
      return [frame('solid', [0, h / 2, 0], [w, h, d])];
    case 'half': {
      const railHeight = h * 0.46;
      return [frame('half', [0, railHeight / 2, 0], [w, railHeight, d])];
    }
    case 'railing': {
      const postH = h * 0.62;
      return [
        frame('post-l', [-w * 0.42, postH / 2, 0], [0.18, postH, d]),
        frame('post-c', [0, postH / 2, 0], [0.16, postH * 0.9, d]),
        frame('post-r', [w * 0.42, postH / 2, 0], [0.18, postH, d]),
        frame('rail-top', [0, postH * 0.82, 0], [w, 0.18, d]),
        frame('rail-mid', [0, postH * 0.48, 0], [w * 0.88, 0.12, d]),
      ];
    }
    case 'door':
    case 'arch': {
      const sideW = w * 0.24;
      const openingW = w - sideW * 2;
      const headerH = kind === 'arch' ? h * 0.34 : h * 0.22;
      const doorH = h - headerH;
      return [
        frame('left', [-(openingW + sideW) / 2, h / 2, 0], [sideW, h, d]),
        frame('right', [(openingW + sideW) / 2, h / 2, 0], [sideW, h, d]),
        frame('top', [0, h - headerH / 2, 0], [openingW, headerH, d]),
        { key: 'door', position: [0, doorH / 2, -d * 0.07], size: [openingW * 0.76, doorH * 0.94, d * 0.34], role: 'door' },
      ];
    }
    case 'window': {
      const sideW = w * 0.22;
      const bandH = h * 0.24;
      const openingW = w - sideW * 2;
      const openingH = h - bandH * 2;
      return [
        frame('left', [-(openingW + sideW) / 2, h / 2, 0], [sideW, h, d]),
        frame('right', [(openingW + sideW) / 2, h / 2, 0], [sideW, h, d]),
        frame('bottom', [0, bandH / 2, 0], [openingW, bandH, d]),
        frame('top', [0, h - bandH / 2, 0], [openingW, bandH, d]),
        { key: 'glass', position: [0, h / 2, -d * 0.08], size: [openingW * 0.82, openingH * 0.72, d * 0.24], role: 'glass' },
      ];
    }
    case 'glass':
      return [
        { key: 'glass-wall', position: [0, h / 2, 0], size: [w, h, d * 0.4], role: 'glass' },
        frame('frame-top', [0, h - 0.08, 0], [w, 0.16, d]),
        frame('frame-bottom', [0, 0.08, 0], [w, 0.16, d]),
        frame('frame-left', [-w / 2 + 0.08, h / 2, 0], [0.16, h, d]),
        frame('frame-right', [w / 2 - 0.08, h / 2, 0], [0.16, h, d]),
      ];
  }
}

/** World boxes of the parts of a wall that stop bodies. */
export function wallSolidBoxes(wall: Pick<WallConfig, 'position' | 'rotation' | 'wallKind'>, group?: Pick<WallGroupConfig, 'defaultWallKind'>): BuildingBox[] {
  const { center, rotationY } = wallBox(wall);
  const cos = exact(Math.cos(rotationY));
  const sin = exact(Math.sin(rotationY));
  return wallPieces(wallKindOf(wall, group))
    .filter((piece) => piece.role !== 'door')
    .map(({ position: [x, y, z], size }) => ({
      center: [center[0] + x * cos + z * sin, wall.position.y + y, center[2] - x * sin + z * cos],
      half: [size[0] / 2, size[1] / 2, size[2] / 2],
      rotationY,
    }));
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
