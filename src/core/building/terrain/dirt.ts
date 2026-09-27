import * as THREE from 'three';

import { ALL_NEIGHBORS, borderDistance, cellKey, neighborMask, smooth, valueNoise } from './grid';
import { tileWorldSize } from '../model/footprint';
import type { TileConfig } from '../types';

/** The top square of a box tile: center, top height and side, in meters. */
export type GroundSquare = { x: number; y: number; z: number; size: number };

export type DirtCoverInput = {
  /** Tiles the path covers. */
  dirt: readonly GroundSquare[];
  /** Other box tiles; the path's soft edge spreads onto those next to it at the same height. */
  ground: readonly GroundSquare[];
  color: THREE.ColorRepresentation;
  accent: THREE.ColorRepresentation;
};

/** Covers whose edge spreads softly onto their flat neighbors. */
export type SpreadCover = 'dirt' | 'sand' | 'snowfield';

/** Each cover's colors when its tiles name none. */
export const COVER_COLORS: Record<SpreadCover, { color: string; accent: string }> = {
  dirt: { color: '#dcbb86', accent: '#b98f5c' },
  sand: { color: '#b89b66', accent: '#e0c27a' },
  snowfield: { color: '#dcecff', accent: '#ffffff' },
};

export type CoverSpread = { cover: SpreadCover; squares: GroundSquare[]; ground: GroundSquare[]; color: string; accent: string };

/**
 * For each cover among `tiles`: its box tiles, the other flat tiles its edge may spread onto (water keeps its own
 * shore), and the colors of its first tile that names some.
 */
export function coverSpreads(tiles: readonly TileConfig[]): CoverSpread[] {
  return (Object.keys(COVER_COLORS) as SpreadCover[]).flatMap((cover) => {
    const squares: GroundSquare[] = [];
    const ground: GroundSquare[] = [];
    let colors: { color: string; accent: string } | undefined;
    for (const tile of tiles) {
      if ((tile.shape ?? 'box') !== 'box' || tile.objectType === 'water') continue;
      const square = { x: tile.position.x, y: tile.position.y, z: tile.position.z, size: tileWorldSize(tile) };
      if (tile.objectType !== cover) ground.push(square);
      else {
        squares.push(square);
        const { terrainColor, terrainAccentColor } = tile.objectConfig ?? {};
        if (!colors && terrainColor) colors = { color: terrainColor, accent: terrainAccentColor ?? terrainColor };
      }
    }
    return squares.length ? [{ cover, squares, ground, ...(colors ?? COVER_COLORS[cover]) }] : [];
  });
}

export const DIRT_COVER = {
  /** Vertex spacing (m): fine enough for the edge to wander. */
  spacing: 0.5,
  /** The edge fades over this band (m), centered this far past the tiles, and wanders up to `wobble` either way. */
  feather: 1.1,
  spread: 0.35,
  wobble: 0.55,
  /** Over the tile top; the material's polygon offset keeps it above the floor too. */
  lift: 0.012,
} as const;

/** Below this alpha a quad is left out: the floor shows through untouched. */
const CLEAR = 0.004;

/** How much of the path covers a point: 1 inside, fading across a wandering band around its border. */
export function dirtAlpha(x: number, z: number, signedDistance: number): number {
  const { feather, spread, wobble } = DIRT_COVER;
  const wander = (valueNoise(x * 0.55 + 1.3, z * 0.55 - 4.1) - 0.5) * 1.4 + (valueNoise(x * 1.6 - 2.2, z * 1.6 + 0.9) - 0.5) * 0.6;
  return 1 - smooth(-feather / 2, feather / 2, signedDistance - spread + wander * wobble);
}

/**
 * One geometry for a set of dirt path tiles: a grid over them and over their same-height neighbors, whose vertex alpha
 * fades the path across a soft, wandering edge with rounded corners, so the tile squares never show. RGB carries a
 * broad mottle between `color` and `accent`. The same tiles build the same cover on every client; null without any.
 */
export function buildDirtCover({ dirt, ground, color, accent }: DirtCoverInput): THREE.BufferGeometry | null {
  if (dirt.length === 0) return null;
  const isDirt = new Set(dirt.map((square) => cellKey(square.x, square.z)));
  const bears = (x: number, z: number) => isDirt.has(cellKey(x, z));
  const grounds = new Map(ground.map((square) => [cellKey(square.x, square.z), square]));
  // The path's tiles and the ones its edge spreads onto, each once.
  const cells = new Map<string, GroundSquare>();
  for (const square of dirt) {
    cells.set(cellKey(square.x, square.z), square);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const key = cellKey(square.x + dx * square.size, square.z + dz * square.size);
        const neighbor = grounds.get(key);
        if (neighbor && !isDirt.has(key) && Math.abs(neighbor.y - square.y) < 0.01 && neighbor.size === square.size) cells.set(key, neighbor);
      }
    }
  }

  const base = new THREE.Color(color);
  const tint = new THREE.Color(accent);
  const mixed = new THREE.Color();
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (const [key, cell] of cells) {
    const inside = isDirt.has(key);
    const mask = neighborMask(cell.x, cell.z, cell.size, bears);
    const steps = Math.max(1, Math.round(cell.size / DIRT_COVER.spacing));
    const first = positions.length / 3;
    const alphas: number[] = [];
    for (let iz = 0; iz <= steps; iz++) {
      for (let ix = 0; ix <= steps; ix++) {
        const lx = (ix / steps - 0.5) * cell.size, lz = (iz / steps - 0.5) * cell.size;
        const x = cell.x + lx, z = cell.z + lz;
        const signed = inside
          ? (mask === ALL_NEIGHBORS ? -Infinity : -borderDistance(mask, lx, lz, cell.size))
          : borderDistance(~mask & ALL_NEIGHBORS, lx, lz, cell.size);
        const alpha = dirtAlpha(x, z, signed);
        alphas.push(alpha);
        const mottle = valueNoise(x * 0.32 + 9.7, z * 0.32 - 2.3) * 0.6 + valueNoise(x * 1.1 - 4.4, z * 1.1 + 6.2) * 0.4;
        mixed.copy(base).lerp(tint, mottle * 0.75);
        positions.push(x, cell.y + DIRT_COVER.lift, z);
        colors.push(mixed.r, mixed.g, mixed.b, alpha);
      }
    }
    for (let iz = 0; iz < steps; iz++) {
      for (let ix = 0; ix < steps; ix++) {
        const a = iz * (steps + 1) + ix, b = a + 1, c = a + steps + 1, d = c + 1;
        if (Math.max(alphas[a]!, alphas[b]!, alphas[c]!, alphas[d]!) < CLEAR) continue;
        indices.push(first + a, first + c, first + b, first + b, first + c, first + d);
      }
    }
  }
  if (indices.length === 0) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(positions.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}
