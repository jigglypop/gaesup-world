import * as THREE from 'three';

import { meadowColor, meadowLift } from './ground';
import { ALL_NEIGHBORS, borderDistance, cellKey, clamp01, DRIFT_TINT, driftPatch, hash2, neighborMask, smooth, valueNoise } from '../../../terrain/grid';
import type { GrassProfile } from '../../../types';

/**
 * Deterministic wind-grass layouts after choketmonster's grass field. Blades are seeded from world coordinates, fan out
 * of clumps and thin toward a ragged border inside the grass-bearing cells. They are listed in R2 low-discrepancy order,
 * so every prefix of the list, which is what a budget draws, stays evenly spread.
 */

/** A grass-bearing cell: local center x, z, top height y and the bits of its grass-bearing neighbors (`neighborMask`). */
export type GrassCell = readonly [x: number, z: number, y?: number, neighbors?: number];

/** Cells whose neighbors are the other cells of the same list. */
export function withNeighborMasks(cells: ReadonlyArray<readonly [number, number, number?, number?]>, size: number): GrassCell[] {
  const keys = new Set(cells.map(([x, z]) => cellKey(x, z)));
  const bears = (x: number, z: number) => keys.has(cellKey(x, z));
  return cells.map(([x, z, y = 0]) => [x, z, y, neighborMask(x, z, size, bears)]);
}

/** Average blade height (m) of each profile at height scale 1. */
export const PROFILE_HEIGHT: Record<GrassProfile, number> = { lawn: 0.25, tall: 0.55 };

type Placement = {
  /** Clump cell (m), the distance over which blades fan out of a clump's heart, and their spread in heading (rad). */
  clump: number;
  spread: number;
  fan: number;
  /** Ragged border: how far it wanders into the grass (base, fine noise, broad noise; m) and the thinning band behind it. */
  wander: readonly [number, number, number];
  band: number;
  /** Tall patches keep their fringe denser. */
  fringe: number;
  salt: number;
};

const PLACEMENT: Record<GrassProfile, Placement> = {
  lawn: { clump: 1.35, spread: 0.95, fan: 1.2, wander: [0.05, 0.45, 0.5], band: 1, fringe: 1, salt: 5 },
  tall: { clump: 0.8, spread: 0.62, fan: 1.5, wander: [0.15, 0.85, 1.1], band: 0.9, fringe: 1.4, salt: 23 },
};

/** What the roots stand on: a flat tile of `color`, or the painted meadow of `color` and `accent`, lifted when `lift`. */
export type GrassSurface = { color: THREE.Color; accent?: THREE.Color; lift?: boolean };

export type GrassLayoutInput = {
  profile: GrassProfile;
  cells: readonly GrassCell[];
  cellSize: number;
  /** World x, z of the local origin: noise, clumps and hashes read world coordinates. */
  originX: number;
  originZ: number;
  /** Candidate blades per m². */
  density: number;
  heightScale: number;
  surface: GrassSurface;
  /** The list stops at this many blades; being a prefix, it stays evenly spread. */
  maxBlades: number;
};

export type GrassLayout = {
  count: number;
  /** Local x, y, z of each root and its draw rank in [0, 1). */
  offsets: Float32Array;
  /** Lean x, lean z (radians toward the bend), height, facing yaw + 8 × tone step (0–15). */
  shapes: Float32Array;
  /** Linear rgb of the ground under each root. */
  tints: Float32Array;
  minY: number;
  maxY: number;
};

export type GrassLayoutBuild = {
  /** Works until `deadline` (a `performance.now()` time), at least one batch; true once `layout` is ready. */
  step(deadline: number): boolean;
  readonly layout: GrassLayout | null;
};

const R2X = 0.7548776662466927;
const R2Z = 0.5698402909980532;
const TAU = Math.PI * 2;
/** Candidates between deadline checks. */
const BATCH = 64;

/** The nearest jittered clump heart of a world-aligned grid (Voronoi), with its id in [0, 1) and distance. */
const clump = { x: 0, z: 0, id: 0, distance: 0 };
function nearestClump(x: number, z: number, size: number, salt: number): typeof clump {
  const gx = Math.floor(x / size), gz = Math.floor(z / size);
  let best = Infinity, bx = 0, bz = 0;
  for (let j = gz - 1; j <= gz + 1; j++) {
    for (let i = gx - 1; i <= gx + 1; i++) {
      const px = (i + 0.15 + hash2(i + salt, j) * 0.7) * size, pz = (j + 0.15 + hash2(j - salt, i + 7.7) * 0.7) * size;
      const distance = (px - x) ** 2 + (pz - z) ** 2;
      if (distance >= best) continue;
      best = distance; bx = i; bz = j; clump.x = px; clump.z = pz;
    }
  }
  clump.id = hash2(bx * 1.31 + salt, bz * 0.77 - salt);
  clump.distance = Math.sqrt(best);
  return clump;
}

/** Flat tiles: broad patches drift between sun-dried and lush, so a lawn is not one flat color. */
function drift(x: number, z: number, base: THREE.Color, target: THREE.Color): THREE.Color {
  const patch = driftPatch(x, z);
  const [r, g, b] = DRIFT_TINT.base, [dr, dg, db] = DRIFT_TINT.swing;
  return target.setRGB(base.r * (r + dr * patch), base.g * (g + dg * patch), base.b * (b + db * patch));
}

/**
 * A resumable layout build. Each cell walks its own R2 sequence from a start seeded by its world position, so a tile
 * keeps its blades when others join or leave the layer; candidates take the cells in turn, so every prefix covers all.
 */
export function createGrassLayoutBuild(input: GrassLayoutInput): GrassLayoutBuild {
  const { profile, cells, cellSize, originX, originZ, heightScale, surface } = input;
  const place = PLACEMENT[profile], tall = profile === 'tall';
  const total = cells.length * Math.max(0, Math.round(input.density * cellSize * cellSize));
  const capacity = Math.max(0, Math.min(total, Math.floor(input.maxBlades)));
  const offsets = new Float32Array(capacity * 4), shapes = new Float32Array(capacity * 4), tints = new Float32Array(capacity * 3);
  const starts = cells.map(([x, z]) => [hash2(originX + x + 41.7, originZ + z - 3.3), hash2(originZ + z + 9.2, originX + x + 5.5)] as const);
  // A cell smaller than the fringe would lose its middle; the fringe shrinks with it.
  const fit = Math.min(1, cellSize / 4);
  const tint = new THREE.Color();
  let index = 0, count = 0, minY = Infinity, maxY = -Infinity;
  let layout: GrassLayout | null = null;

  const candidate = (k: number) => {
    const cell = k % cells.length, round = (k - cell) / cells.length;
    const [cx, cz, cy = 0, mask = 0] = cells[cell]!;
    const [startX, startZ] = starts[cell]!;
    const lx = (((startX + round * R2X) % 1) - 0.5) * cellSize, lz = (((startZ + round * R2Z) % 1) - 0.5) * cellSize;
    const x = originX + cx + lx, z = originZ + cz + lz;
    let fade = 1, rise = 1;
    if (mask !== ALL_NEIGHBORS) {
      // The border wanders into the grass and thins behind it, so the cells' squares never show.
      const edge = borderDistance(mask, lx, lz, cellSize);
      const [base, fine, broad] = place.wander;
      const ragged = (base + fine * valueNoise(x * 0.85 + 3.1, z * 0.85 - 7.3) + broad * valueNoise(x * 0.27 - 1.7, z * 0.27 + 4.9)) * fit;
      if (edge < ragged) return;
      fade = smooth(ragged, ragged + place.band * fit, edge);
      if (hash2(x * 1.37 + 5.1, z * 2.11 - 3.7) >= fade * place.fringe) return;
      rise = smooth(ragged, ragged + 1.4 * fit, edge);
    }
    // Blades of a clump share height and tone and fan out from its heart; tufts dome over their hearts.
    const heart = nearestClump(x, z, place.clump, place.salt);
    const spread = Math.min(1, heart.distance / place.spread);
    const r1 = hash2(x * 1.7 + 3.1, z * 2.3), r2 = hash2(z * 3.1, x * 0.9 - 1.7), r3 = hash2(x - z * 5.1, z + x * 0.3);
    const direction = Math.atan2(z - heart.z, x - heart.x) + (r1 - 0.5) * place.fan;
    const height = heightScale * (tall
      ? (0.56 + r3 * 0.2) * (0.84 + heart.id * 0.3) * (1 - 0.36 * spread * spread) * (0.6 + 0.4 * rise)
        * (0.84 + 0.32 * valueNoise(x * 0.21 + 11, z * 0.21 - 5))
      : (0.19 + r3 * 0.13) * (0.78 + heart.id * 0.44) * (0.8 + 0.4 * valueNoise(x * 0.09, z * 0.09)) * (0.62 + 0.38 * fade));
    const lean = tall ? 0.1 + spread * 0.42 + r2 * 0.1 : 0.14 + spread * 0.4 + r2 * 0.16;
    const yaw = (((direction + (r2 - 0.5) * (tall ? 0.7 : 0.6)) % TAU) + TAU) % TAU;
    const tone = tall
      ? heart.id * 0.6 + valueNoise(x * 0.07 - 5, z * 0.07 + 3) * 0.4
      : heart.id * 0.55 + valueNoise(x * 0.05 + 17, z * 0.05 - 9) * 0.45;
    const y = cy + (surface.lift ? meadowLift(x, z) - 0.02 : -0.01);
    if (surface.accent) meadowColor(x, z, surface.color, surface.accent, tint);
    else drift(x, z, surface.color, tint);
    const o = count * 4;
    offsets[o] = cx + lx; offsets[o + 1] = y; offsets[o + 2] = cz + lz;
    shapes[o] = Math.cos(direction) * lean; shapes[o + 1] = Math.sin(direction) * lean; shapes[o + 2] = height;
    shapes[o + 3] = yaw + 8 * Math.round(clamp01(tone) * 15);
    tint.toArray(tints, count * 3);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    count++;
  };

  const finish = (): GrassLayout => {
    // Draw rank in the fourth offset: budgets and the shader's distance fade keep the same prefix.
    for (let blade = 0; blade < count; blade++) offsets[blade * 4 + 3] = blade / count;
    return {
      count, offsets: offsets.slice(0, count * 4), shapes: shapes.slice(0, count * 4), tints: tints.slice(0, count * 3),
      minY: count ? minY : 0, maxY: count ? maxY : 0,
    };
  };

  return {
    get layout() { return layout; },
    step(deadline) {
      if (layout) return true;
      do {
        for (const end = Math.min(total, index + BATCH); index < end && count < capacity; index++) candidate(index);
      } while (index < total && count < capacity && performance.now() < deadline);
      if (index < total && count < capacity) return false;
      layout = finish();
      return true;
    },
  };
}

/** Builds a layout at once. */
export function buildGrassLayout(input: GrassLayoutInput): GrassLayout {
  const build = createGrassLayoutBuild(input);
  build.step(Infinity);
  return build.layout!;
}
