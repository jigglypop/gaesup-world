import * as THREE from 'three';

import { CROPS, plotRow, SOILS } from './config';
import { FARM_EDGE, PADDY_WATER, SOIL_BASE, soilAt, type FarmSquare, type SoilPoint } from './layout';
import { smooth, valueNoise } from '../grid';

/** Samples (m) along a bed's rows: fine where a bank or settle may rise at the ends, coarse between. */
const ALONG = { band: 0.7, fine: 0.06, coarse: 0.4 } as const;
/** Across the rows: five samples per furrow, never coarser than a bank needs. */
const ACROSS_MAX = 0.08;
/** Paddy water hides this far in under the bank's crest. */
const WATER_INSET = 0.19;
const WEED_CANOPY = '#7d9a4a';
/** Grass that grows on the banks, in patches. */
const BANK_GRASS = '#6f9a48';
/** How much of a ridge each growth stage covers. */
const STAGE_COVER = { sprout: 0.3, young: 0.7, ripe: 1 } as const;
const EPSILON = 0.02;

/** Offsets over a tile side from −size/2 to size/2, mirrored so every tile of a plot samples its sides alike. */
function axis(size: number, step: (fromEnd: number) => number): number[] {
  const half = size / 2, side: number[] = [];
  for (let t = 0; t < half - 1e-6; t += step(t)) side.push(t);
  return [...side.map((t) => t - half), 0, ...side.reverse().map((t) => half - t)].filter((v, i, all) => i === 0 || v - all[i - 1]! > 1e-6);
}

/** The local offsets (u along x, v along z) of a square's grid; all squares of a plot share them, so edges match. */
function grid(square: FarmSquare): { u: number[]; v: number[] } {
  const across = square.size / Math.max(1, Math.round(square.size / Math.min(ACROSS_MAX, plotRow(square.plot) / 5)));
  const acrossAxis = axis(square.size, () => across);
  const alongAxis = axis(square.size, (t) => (t < ALONG.band ? ALONG.fine : ALONG.coarse));
  return square.plot.rows === 'x' ? { u: alongAxis, v: acrossAxis } : { u: acrossAxis, v: alongAxis };
}

const linearColor = (hex: string) => new THREE.Color(hex);

export type FarmSoilGeometry = {
  /** Soil of every square: `color`, `farmSoil` (trough, crack, wet, canopy share) and `farmCanopy` (foliage color). */
  surface: THREE.BufferGeometry | null;
  /** Shallow water over paddy squares, inside their banks. */
  water: THREE.BufferGeometry | null;
};

/**
 * The soil of `squares` as one surface: world-space furrows, so a bed's tiles meet without a seam, banks at open
 * borders, and vertex attributes the soil material shades by; paddy squares also get their water. Normals come from
 * the grid's neighbors, and on a tile's sides from the soil field just past them, so tiles shade alike across a join.
 */
export function buildFarmSoil(squares: readonly FarmSquare[]): FarmSoilGeometry {
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], soils: number[] = [], canopies: number[] = [];
  const indices: number[] = [], water: number[] = [], waterIndices: number[] = [];
  const point: SoilPoint = { height: 0, trough: 0, bank: 0, distance: 0 };
  const probe: SoilPoint = { ...point };
  const dark = new THREE.Color(), light = new THREE.Color(), paint = new THREE.Color(), canopy = new THREE.Color(), grass = new THREE.Color(BANK_GRASS);

  for (const square of squares) {
    const { plot } = square, soil = SOILS[plot.soil], edge = FARM_EDGE[plot.edge];
    const crop = plot.crop === 'none' ? null : CROPS[plot.crop];
    dark.copy(linearColor(soil.color));
    light.copy(linearColor(soil.accent));
    canopy.set(crop ? crop.canopy : WEED_CANOPY);
    const { u, v } = grid(square);
    const first = positions.length / 3, row = u.length;
    const heightAt = (lx: number, lz: number) => soilAt(square, lx, lz, probe).height;
    const wetLevel: boolean[] = [], heights: number[] = [];
    for (const lz of v) {
      for (const lx of u) {
        const x = square.x + lx, z = square.z + lz;
        soilAt(square, lx, lz, point);
        heights.push(point.height);
        positions.push(x, square.y + point.height, z);
        // Ridge crumbs dry lighter than the moist troughs; the bank is packed and drier still.
        const mottle = 0.9 + 0.2 * valueNoise(x * 0.9 + 4.1, z * 0.9 - 2.6);
        paint.copy(dark).lerp(light, Math.min(1, 0.2 + 0.65 * (1 - point.trough) + 0.2 * point.bank)).multiplyScalar(mottle);
        paint.lerp(grass, point.bank ** 1.5 * (0.25 + 0.6 * valueNoise(x * 2.3 + 1.2, z * 2.3 - 5.1)));
        colors.push(paint.r, paint.g, paint.b);
        const planted = crop ? crop.cover * STAGE_COVER[plot.stage] * (1 - point.trough) ** 1.5 * smooth(edge.margin, edge.margin + 0.3, point.distance) : 0;
        const weedy = soil.weeds * 0.35 * smooth(0.35, 0.8, valueNoise(x * 0.6 + 3, z * 0.6 - 7));
        soils.push(point.trough, soil.crack * (1 - point.bank * 0.6), soil.wet * (0.35 + 0.65 * point.trough), Math.max(planted, weedy));
        canopies.push(canopy.r, canopy.g, canopy.b);
        wetLevel.push(soil.water && point.distance >= WATER_INSET);
      }
    }
    // Slopes from the grid's own neighbors; on the tile's sides from the field just past them, so tiles shade alike.
    const slope = (at: readonly number[], index: number, stride: number, k: number, aside: (step: number) => number) =>
      index > 0 && index < at.length - 1
        ? (heights[k - stride]! - heights[k + stride]!) / (at[index + 1]! - at[index - 1]!)
        : (aside(-EPSILON) - aside(EPSILON)) / (2 * EPSILON);
    v.forEach((lz, j) => u.forEach((lx, i) => {
      const k = j * row + i;
      const nx = slope(u, i, 1, k, (step) => heightAt(lx + step, lz)), nz = slope(v, j, row, k, (step) => heightAt(lx, lz + step));
      const length = Math.hypot(nx, 1, nz);
      normals.push(nx / length, 1 / length, nz / length);
    }));
    for (let j = 0; j < v.length - 1; j++) {
      for (let i = 0; i < row - 1; i++) {
        const a = j * row + i, b = a + 1, c = a + row, d = c + 1;
        indices.push(first + a, first + c, first + b, first + b, first + c, first + d);
        if (!(wetLevel[a] && wetLevel[b] && wetLevel[c] && wetLevel[d])) continue;
        const base = water.length / 3, level = square.y + SOIL_BASE + soil.furrow * PADDY_WATER;
        for (const k of [a, b, c, d]) water.push(square.x + u[k % row]!, level, square.z + v[Math.floor(k / row)]!);
        waterIndices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }
  }

  const surface = indices.length ? new THREE.BufferGeometry() : null;
  if (surface) {
    surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    surface.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    surface.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surface.setAttribute('farmSoil', new THREE.Float32BufferAttribute(soils, 4));
    surface.setAttribute('farmCanopy', new THREE.Float32BufferAttribute(canopies, 3));
    surface.setIndex(indices);
    surface.computeBoundingSphere();
  }
  let pond: THREE.BufferGeometry | null = null;
  if (waterIndices.length) {
    pond = new THREE.BufferGeometry();
    pond.setAttribute('position', new THREE.Float32BufferAttribute(water, 3));
    pond.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(water.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    pond.setIndex(waterIndices);
    pond.computeBoundingSphere();
  }
  return { surface, water: pond };
}

/** Board and post sizes of wooden edging (m). */
const BOARD = { height: 0.2, thickness: 0.06, post: 0.085, postHeight: 0.28 } as const;
const WOOD = { board: '#b98a55', top: '#d4a872', post: '#8d6440' } as const;

type Box = { center: [number, number, number]; size: [number, number, number]; color: string; top: string };

/** A box's six faces as flat-shaded triangles with the top face in its own color. */
function pushBox(box: Box, positions: number[], normals: number[], colors: number[]): void {
  const [cx, cy, cz] = box.center, [sx, sy, sz] = box.size.map((s) => s / 2) as [number, number, number];
  const side = new THREE.Color(box.color), top = new THREE.Color(box.top);
  const faces: [number[], number[][]][] = [
    [[0, 1, 0], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]]],
    [[1, 0, 0], [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]],
    [[-1, 0, 0], [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]]],
    [[0, 0, 1], [[1, -1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1]]],
    [[0, 0, -1], [[-1, -1, -1], [-1, 1, -1], [1, 1, -1], [1, -1, -1]]],
  ];
  for (const [normal, corners] of faces) {
    const color = normal[1] === 1 ? top : side;
    for (const index of [0, 1, 2, 0, 2, 3]) {
      const [x, y, z] = corners[index]!;
      positions.push(cx + x! * sx, cy + y! * sy, cz + z! * sz);
      normals.push(...normal);
      // Board faces darken toward their foot, where soil and shade meet them.
      const foot = normal[1] === 1 ? 1 : y! < 0 ? 0.72 : 1;
      colors.push(color.r * foot, color.g * foot, color.b * foot);
    }
  }
}

/** Neighbor bits of the four sides in `neighborMask` order and the side's outward direction. */
const SIDES = [[1, -1, 0], [2, 1, 0], [4, 0, -1], [8, 0, 1]] as const;

/** Wooden edging along the open sides of wood-edged squares: a board per side and a post at each of its ends. */
export function buildFarmBoards(squares: readonly FarmSquare[]): THREE.BufferGeometry | null {
  const positions: number[] = [], normals: number[] = [], colors: number[] = [];
  const posts = new Set<string>();
  for (const square of squares) {
    if (square.plot.edge !== 'wood') continue;
    const half = square.size / 2, inset = half - BOARD.thickness / 2;
    for (const [bit, dx, dz] of SIDES) {
      if (square.mask & bit) continue;
      const along: [number, number, number] = dx ? [BOARD.thickness, BOARD.height, square.size] : [square.size, BOARD.height, BOARD.thickness];
      pushBox({ center: [square.x + dx * inset, square.y + BOARD.height / 2, square.z + dz * inset], size: along, color: WOOD.board, top: WOOD.top }, positions, normals, colors);
      for (const end of [-1, 1]) {
        const px = square.x + (dx ? dx * inset : end * inset), pz = square.z + (dz ? dz * inset : end * inset);
        const key = `${Math.round(px * 20)}:${Math.round(pz * 20)}`;
        if (posts.has(key)) continue;
        posts.add(key);
        pushBox({ center: [px, square.y + BOARD.postHeight / 2, pz], size: [BOARD.post, BOARD.postHeight, BOARD.post], color: WOOD.post, top: WOOD.top }, positions, normals, colors);
      }
    }
  }
  if (!positions.length) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}
