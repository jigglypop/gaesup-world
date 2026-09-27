import { createNoise2D } from 'simplex-noise';

/**
 * Grid-cell and noise helpers shared by ground layers (grass, dirt paths): which neighbors of a cell carry a layer, how
 * far a point is from the layer's border, and deterministic world noise so every client draws the same ground.
 */

/** Neighbor offsets in mask bit order: west, east, north, south, then the corners. */
const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]] as const;
export const ALL_NEIGHBORS = 0xff;

export const cellKey = (x: number, z: number): string => `${Math.round(x * 8)}:${Math.round(z * 8)}`;

/** Bits of the eight neighbors one `size` away from (x, z) that carry the layer. */
export function neighborMask(x: number, z: number, size: number, bears: (x: number, z: number) => boolean): number {
  let mask = 0;
  NEIGHBORS.forEach(([dx, dz], bit) => {
    if (bears(x + dx * size, z + dz * size)) mask |= 1 << bit;
  });
  return mask;
}

/**
 * Distance from a point (lx, lz) of a `size` cell, relative to its center, to the nearest neighbor that does not carry
 * the layer: its side, or its corner, which rounds the border. Infinity when every neighbor carries it. With the mask
 * inverted it is the distance from a cell outside the layer to the layer.
 */
export function borderDistance(mask: number, lx: number, lz: number, size: number): number {
  const half = size / 2, west = lx + half, east = half - lx, north = lz + half, south = half - lz;
  let edge = Infinity;
  if (!(mask & 1)) edge = Math.min(edge, west);
  if (!(mask & 2)) edge = Math.min(edge, east);
  if (!(mask & 4)) edge = Math.min(edge, north);
  if (!(mask & 8)) edge = Math.min(edge, south);
  if (!(mask & 16)) edge = Math.min(edge, Math.hypot(west, north));
  if (!(mask & 32)) edge = Math.min(edge, Math.hypot(east, north));
  if (!(mask & 64)) edge = Math.min(edge, Math.hypot(west, south));
  if (!(mask & 128)) edge = Math.min(edge, Math.hypot(east, south));
  return edge;
}

/** A stable number in [0, 1) for a point, the same on every client. */
export function hash2(a: number, b: number): number {
  let h = Math.imul(Math.round(a * 1024) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(b * 1024) | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const smooth = (edge0: number, edge1: number, value: number): number => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** Smooth value noise in [0, 1) on a unit lattice. */
export function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return (a + (b - a) * sx) * (1 - sz) + (c + (d - c) * sx) * sz;
}

/** Seeded, so ground layers read the same field after every reload and on every client. */
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth simplex noise in [-1, 1] over world coordinates, the same everywhere. */
export const worldNoise = createNoise2D(seeded(0x6a09e667));
