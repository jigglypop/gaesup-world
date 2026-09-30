import { CROPS, plotKey, plotRow, readTilePlot, SOILS, type FarmPlot } from './config';
import { tileWorldSize } from '../../model/footprint';
import type { FarmEdge, TileConfig } from '../../types';
import { ALL_NEIGHBORS, borderDistance, cellKey, hash2, neighborMask, smooth, valueNoise } from '../grid';

/** A farm tile's top square, its plot, and the bits of its neighbors in the same bed (`neighborMask`). */
export type FarmSquare = { x: number; y: number; z: number; size: number; plot: FarmPlot; key: string; mask: number };

/** How a bed meets other ground: where it settles to the tile top, where its rows fade, its bank, and the planting margin. */
export const FARM_EDGE: Record<FarmEdge, { settle: number; fade: readonly [number, number]; bank: number; margin: number }> = {
  ridge: { settle: 0.1, fade: [0.3, 0.66], bank: 0.14, margin: 0.42 },
  wood: { settle: 0.03, fade: [0.1, 0.32], bank: 0, margin: 0.22 },
  none: { settle: 0.75, fade: [0.25, 0.95], bank: 0, margin: 0.5 },
};

/** Soil over the tile top (m), the least it keeps at a border so it never fights the tile, the bank's crest and half width. */
export const SOIL_BASE = 0.035;
const SOIL_FLOOR = 0.008;
const BANK_AT = 0.21;
const BANK_WIDTH = 0.11;
/** Paddy water stands this share of the furrow over the troughs, so the rice ridges just break its surface. */
export const PADDY_WATER = 0.8;

/** Box farm tiles with their plots and same-bed neighbors: tiles of one plot, height and size join. */
export function farmSquares(tiles: readonly TileConfig[]): FarmSquare[] {
  const entries = tiles
    .filter((tile) => tile.objectType === 'farm' && (tile.shape ?? 'box') === 'box')
    .map((tile) => {
      const plot = readTilePlot(tile);
      return { x: tile.position.x, y: tile.position.y, z: tile.position.z, size: tileWorldSize(tile), plot, key: plotKey(plot) };
    });
  const beds = new Map(entries.map((entry) => [cellKey(entry.x, entry.z), entry]));
  return entries.map((entry) => ({
    ...entry,
    mask: neighborMask(entry.x, entry.z, entry.size, (x, z) => {
      const other = beds.get(cellKey(x, z));
      return !!other && other.key === entry.key && other.size === entry.size && Math.abs(other.y - entry.y) < 0.01;
    }),
  }));
}

export type SoilPoint = {
  /** Over the tile top (m). */
  height: number;
  /** 0 on a ridge's crest, 1 in a trough; 0 where the rows fade out at the border. */
  trough: number;
  /** 0..1 up the bank. */
  bank: number;
  /** From the bed's open border (m); Infinity inside a bed. */
  distance: number;
};

/**
 * The soil of `square` at local (lx, lz): furrows at world-aligned row spacing, so rows run on across the bed's tiles,
 * crumbs over them, and toward an open border the rows fade into a bank (ridge), the boards (wood) or the ground.
 */
export function soilAt(square: FarmSquare, lx: number, lz: number, out: SoilPoint): SoilPoint {
  const { plot, size, mask } = square;
  const edge = FARM_EDGE[plot.edge], soil = SOILS[plot.soil];
  const x = square.x + lx, z = square.z + lz;
  const distance = mask === ALL_NEIGHBORS ? Infinity : borderDistance(mask, lx, lz, size);
  const across = (plot.rows === 'x' ? z : x) / plotRow(plot);
  const ridge = (0.5 - 0.5 * Math.cos((across - Math.floor(across)) * Math.PI * 2)) ** 0.7;
  const fade = smooth(edge.fade[0], edge.fade[1], distance);
  const crumbs = (valueNoise(x * 7.3 + 1.7, z * 7.3 - 4.2) - 0.5) * (plot.soil === 'paddy' ? 0.006 : 0.022);
  const bank = edge.bank * Math.exp(-(((distance - BANK_AT) / BANK_WIDTH) ** 2)) * (0.85 + 0.3 * valueNoise(x * 1.9, z * 1.9));
  out.height = SOIL_FLOOR + smooth(0, edge.settle, distance) * (SOIL_BASE + (soil.furrow * ridge + crumbs) * fade + bank);
  out.trough = (1 - ridge) * fade;
  out.bank = edge.bank ? bank / edge.bank : 0;
  out.distance = distance;
  return out;
}

/** Plants of one bed chunk, sorted by draw rank so any prefix stays evenly spread. */
export type PlantLayout = {
  count: number;
  /** Root x, y, z and draw rank in [0, 1). */
  roots: Float32Array;
  /** Yaw and scale of each plant. */
  turns: Float32Array;
  /** Linear bloom color and a shade in [0, 1]. */
  tints: Float32Array;
};

type Plant = { x: number; y: number; z: number; rank: number; yaw: number; scale: number; bloom: [number, number, number]; shade: number };

const WHITE: [number, number, number] = [1, 1, 1];
const TAU = Math.PI * 2;

const srgbToLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
function linear(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [srgbToLinear(((value >> 16) & 255) / 255), srgbToLinear(((value >> 8) & 255) / 255), srgbToLinear((value & 255) / 255)];
}

/** Whether world (x, z) belongs to `square`: half-open, so a point on a shared side lands in one tile. */
const owns = (square: FarmSquare, x: number, z: number) => {
  const half = square.size / 2;
  return x >= square.x - half && x < square.x + half && z >= square.z - half && z < square.z + half;
};

function pack(plants: Plant[]): PlantLayout {
  plants.sort((a, b) => a.rank - b.rank);
  const count = plants.length;
  const roots = new Float32Array(count * 4), turns = new Float32Array(count * 2), tints = new Float32Array(count * 4);
  plants.forEach((plant, i) => {
    roots.set([plant.x, plant.y, plant.z, plant.rank], i * 4);
    turns.set([plant.yaw, plant.scale], i * 2);
    tints.set([...plant.bloom, plant.shade], i * 4);
  });
  return { count, roots, turns, tints };
}

/**
 * The crop of a bed's squares in rows: row centers and plants along them sit on a world grid, so rows continue across
 * the bed's tiles, alternate rows stagger by half a gap, and planting keeps clear of the bed's open border. Every
 * client lays out the same plants; flowers take the crop's bloom colors row by row.
 */
export function cropLayout(squares: readonly FarmSquare[]): PlantLayout {
  const plants: Plant[] = [];
  const point = { height: 0, trough: 0, bank: 0, distance: 0 };
  for (const square of squares) {
    const { plot } = square;
    if (plot.crop === 'none') continue;
    const spec = CROPS[plot.crop];
    const margin = FARM_EDGE[plot.edge].margin + Math.min(0.25, spec.gap * 0.25);
    const blooms = spec.blooms?.map(linear);
    const half = square.size / 2;
    const [c0, a0] = plot.rows === 'x' ? [square.z - half, square.x - half] : [square.x - half, square.z - half];
    for (let k = Math.floor(c0 / spec.row); (k + 0.5) * spec.row < c0 + square.size + spec.row; k++) {
      for (let j = Math.floor(a0 / spec.gap) - 1; j * spec.gap < a0 + square.size + spec.gap; j++) {
        const r1 = hash2(k * 1.37 + 0.5, j * 0.71 - 3.1), r2 = hash2(j * 1.13 + 7.7, k * 0.53 + 2.9), r3 = hash2(k - j * 2.1, j + k * 0.3);
        const across = (k + 0.5 + (r1 - 0.5) * 0.12) * spec.row;
        const along = (j + 0.5 + (k & 1) * 0.5 + (r2 - 0.5) * 0.24) * spec.gap;
        const [x, z] = plot.rows === 'x' ? [along, across] : [across, along];
        if (!owns(square, x, z)) continue;
        soilAt(square, x - square.x, z - square.z, point);
        if (point.distance < margin) continue;
        // Sunflowers turn their faces south, toward the island camera, give or take.
        const face = plot.crop === 'sunflower' ? -Math.PI / 2 + 0.25 + (r3 - 0.5) * 0.6 : r3 * TAU;
        plants.push({
          x, y: square.y + point.height, z, rank: hash2(x * 3.1 + 0.3, z * 2.7 - 1.9),
          yaw: face, scale: 0.86 + 0.28 * r1, bloom: blooms ? blooms[((k % blooms.length) + blooms.length) % blooms.length]! : WHITE,
          shade: r2,
        });
      }
    }
  }
  return pack(plants);
}

/** Weeds of fallow beds: tufts scattered in patches over the soil, clear of the border. */
export function weedLayout(squares: readonly FarmSquare[]): PlantLayout {
  const plants: Plant[] = [];
  const point = { height: 0, trough: 0, bank: 0, distance: 0 };
  const step = 0.32;
  for (const square of squares) {
    if (!SOILS[square.plot.soil].weeds) continue;
    const half = square.size / 2;
    for (let i = Math.floor((square.x - half) / step); i * step < square.x + half; i++) {
      for (let j = Math.floor((square.z - half) / step); j * step < square.z + half; j++) {
        const x = (i + 0.2 + hash2(i + 0.5, j - 0.5) * 0.6) * step, z = (j + 0.2 + hash2(j + 3.3, i - 1.1) * 0.6) * step;
        if (!owns(square, x, z) || hash2(x * 5.1, z * 4.3) > 0.35 + valueNoise(x * 0.6 + 3, z * 0.6 - 7) * 0.5) continue;
        soilAt(square, x - square.x, z - square.z, point);
        if (point.distance < 0.25) continue;
        plants.push({
          x, y: square.y + point.height, z, rank: hash2(x * 2.3 - 0.7, z * 3.7 + 1.3),
          yaw: hash2(z, x) * TAU, scale: 0.7 + 0.6 * hash2(x + 9, z - 9), bloom: WHITE, shade: hash2(x - 4, z + 4),
        });
      }
    }
  }
  return pack(plants);
}

export type FarmChunk = { key: string; squares: FarmSquare[] };

/** Squares grouped into chunks `span` meters on a side and, within one, by `group`: a chunk is a draw and a LOD unit. */
export function farmChunks(squares: readonly FarmSquare[], span: number, group: (square: FarmSquare) => string | null = () => ''): FarmChunk[] {
  const chunks = new Map<string, FarmChunk>();
  for (const square of squares) {
    const kind = group(square);
    if (kind === null) continue;
    const key = `${Math.floor(square.x / span)}:${Math.floor(square.z / span)}|${kind}`;
    let chunk = chunks.get(key);
    if (!chunk) chunks.set(key, (chunk = { key, squares: [] }));
    chunk.squares.push(square);
  }
  return [...chunks.values()];
}
