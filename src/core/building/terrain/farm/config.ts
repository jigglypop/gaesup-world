import { drawCount, lodWeight, type GrassCurve } from '../../components/mesh/grass/budget';
import type { FarmCrop, FarmEdge, FarmPlotConfig, FarmRows, FarmSoil, FarmStage, TileConfig } from '../../types';

/** A plot with every choice made. */
export type FarmPlot = Required<FarmPlotConfig>;

export type CropSpec = {
  /** The soil a plot of it gets when it names none. */
  soil: FarmSoil;
  /** Meters between rows and between plants along a row; neighbors in alternate rows sit half a gap apart. */
  row: number;
  gap: number;
  /** Ripe height (m): bounds, and tall crops cast shadows and read from farther away. */
  height: number;
  /** Foliage color the soil paints over its rows as far plants thin out, and how much of a ridge it covers. */
  canopy: string;
  cover: number;
  /** Flower colors, one per row in turn; a plant's flowers otherwise keep their own color. */
  blooms?: readonly string[];
};

export type SoilSpec = {
  /** Dark moist soil in the troughs and the lighter, drier crumbs on the ridges. */
  color: string;
  accent: string;
  /** Ridge height over the troughs (m). */
  furrow: number;
  /** 0..1: cracks, gloss of wet soil, weeds between the rows. */
  crack: number;
  wet: number;
  weeds: number;
  /** Shallow water between the rows. */
  water: boolean;
};

/** Rows of a bare plot. */
export const BARE_ROW = 0.5;

export const CROPS: Record<Exclude<FarmCrop, 'none'>, CropSpec> = {
  lettuce: { soil: 'tilled', row: 0.5, gap: 0.42, height: 0.24, canopy: '#8cc45a', cover: 0.85 },
  cabbage: { soil: 'tilled', row: 0.6, gap: 0.55, height: 0.32, canopy: '#9cc98f', cover: 0.9 },
  carrot: { soil: 'tilled', row: 0.4, gap: 0.16, height: 0.34, canopy: '#5f9e3c', cover: 0.6 },
  potato: { soil: 'tilled', row: 0.6, gap: 0.45, height: 0.42, canopy: '#4f8a3a', cover: 0.95 },
  tomato: { soil: 'tilled', row: 0.8, gap: 0.6, height: 1.25, canopy: '#4d7f34', cover: 0.6 },
  corn: { soil: 'tilled', row: 0.8, gap: 0.42, height: 2, canopy: '#6d9c3c', cover: 0.75 },
  wheat: { soil: 'tilled', row: 0.25, gap: 0.2, height: 0.85, canopy: '#dcb65a', cover: 1 },
  rice: { soil: 'paddy', row: 0.45, gap: 0.34, height: 0.75, canopy: '#7fae4a', cover: 0.7 },
  pumpkin: { soil: 'tilled', row: 1, gap: 0.9, height: 0.45, canopy: '#4f8a3a', cover: 0.95 },
  melon: { soil: 'tilled', row: 1, gap: 0.8, height: 0.36, canopy: '#5b9440', cover: 0.95 },
  strawberry: { soil: 'tilled', row: 0.5, gap: 0.34, height: 0.2, canopy: '#4f8f3c', cover: 0.8 },
  sunflower: { soil: 'tilled', row: 0.8, gap: 0.5, height: 1.9, canopy: '#e2b92e', cover: 0.65 },
  tulip: {
    soil: 'tilled', row: 0.4, gap: 0.2, height: 0.46, canopy: '#c7856e', cover: 0.7,
    blooms: ['#f0485e', '#f7c948', '#f59ac0', '#fbf3e4', '#b36ad8'],
  },
  lavender: { soil: 'tilled', row: 0.8, gap: 0.6, height: 0.62, canopy: '#9580cc', cover: 0.95 },
  herb: { soil: 'tilled', row: 0.5, gap: 0.34, height: 0.34, canopy: '#5e9a46', cover: 0.85 },
};

export const SOILS: Record<FarmSoil, SoilSpec> = {
  tilled: { color: '#523a29', accent: '#86654a', furrow: 0.1, crack: 0, wet: 0.2, weeds: 0, water: false },
  watered: { color: '#38281c', accent: '#5e4431', furrow: 0.09, crack: 0, wet: 1, weeds: 0, water: false },
  dry: { color: '#94785a', accent: '#bfa482', furrow: 0.045, crack: 1, wet: 0, weeds: 0, water: false },
  paddy: { color: '#43382a', accent: '#65563f', furrow: 0.04, crack: 0, wet: 1, weeds: 0, water: true },
  fallow: { color: '#65503a', accent: '#8f7654', furrow: 0.03, crack: 0.25, wet: 0, weeds: 1, water: false },
};

/** Distance LOD of crops: full rows to `near`, thinned to nothing at `far`. Tall crops read from farther away. */
export const CROP_LOD: Record<'low' | 'tall', GrassCurve> = {
  low: { near: 34, far: 76, strength: 1.3 },
  tall: { near: 44, far: 96, strength: 1.2 },
};

export const isTallCrop = (crop: FarmCrop): boolean => crop !== 'none' && CROPS[crop].height >= 1;

/** Chunks nearer than this (m) draw the full plants, farther ones the coarse tier; tall crops keep detail 10 m longer. */
export const FARM_NEAR_TIER = 20;
const TALL_TIER_REACH = 10;

/**
 * The plants a chunk of `count` draws at `distance` (m) from its nearest point: its LOD share of the rank-sorted list,
 * plus the `band` over which the shader shrinks the last of them, and the geometry tier.
 */
export function plantDraw(count: number, distance: number, tall: boolean, band = 0): { count: number; tier: 0 | 1 } {
  const share = lodWeight(distance, CROP_LOD[tall ? 'tall' : 'low']);
  return { count: drawCount(count, share, 1, band), tier: distance - (tall ? TALL_TIER_REACH : 0) < FARM_NEAR_TIER ? 0 : 1 };
}

const CROP_KEYS = new Set<string>(['none', ...Object.keys(CROPS)]);
const SOIL_KEYS = new Set<string>(Object.keys(SOILS));
const STAGES: readonly FarmStage[] = ['sprout', 'young', 'ripe'];
const EDGES = new Set<string>(['ridge', 'wood', 'none']);

/** Names an older layout or a hand-written save may use. */
const CROP_ALIASES: Record<string, FarmCrop> = {
  'pumpkin-bed': 'pumpkin', 'carrot-bed': 'carrot', 'corn-bed': 'corn', 'wheat-bed': 'wheat', 'tomato-bed': 'tomato',
  'turnip-bed': 'cabbage', turnip: 'cabbage', flowers: 'tulip', flower: 'tulip', sprout: 'lettuce', sprouts: 'lettuce', bare: 'none',
};
const STAGE_ALIASES: Record<string, FarmStage> = { seedling: 'sprout', sprouts: 'sprout', growing: 'young', grown: 'ripe', mature: 'ripe' };

const text = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : undefined);

function readCrop(value: unknown): { crop: FarmCrop; sprout: boolean } {
  const name = text(value);
  if (!name) return { crop: 'none', sprout: false };
  if (CROP_KEYS.has(name)) return { crop: name as FarmCrop, sprout: false };
  const alias = CROP_ALIASES[name];
  return { crop: alias ?? 'none', sprout: name.startsWith('sprout') };
}

function readStage(value: unknown): FarmStage | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return STAGES[Math.max(0, Math.min(2, Math.round(value)))];
  const name = text(value);
  if (!name) return undefined;
  return (STAGES as readonly string[]).includes(name) ? (name as FarmStage) : STAGE_ALIASES[name];
}

/** Rows along x, or along z when the tile is turned a quarter (or three). */
export function rowsOfRotation(rotation = 0): FarmRows {
  const quarters = Math.round(rotation / (Math.PI / 2));
  return ((quarters % 2) + 2) % 2 === 1 ? 'z' : 'x';
}

/**
 * A farm tile's plot from its stored `objectConfig.farm`, any field missing or unknown falling back: the crop's own
 * soil, ripe, rows by the tile's quarter turn, a ridge. Older names (`'carrot-bed'`, `'sprouts'`, stage numbers 0–2)
 * read as today's. Pure: every client reads the same plot from the same save.
 */
export function readFarmPlot(config: unknown, rotation?: number): FarmPlot {
  const farm = (config && typeof config === 'object' ? config : {}) as Record<string, unknown>;
  const { crop, sprout } = readCrop(farm['crop'] ?? farm['kind']);
  const soil = text(farm['soil']);
  const rows = text(farm['rows']);
  const edge = text(farm['edge']);
  return {
    crop,
    soil: soil && SOIL_KEYS.has(soil) ? (soil as FarmSoil) : crop === 'none' ? 'tilled' : CROPS[crop].soil,
    stage: readStage(farm['stage']) ?? (sprout ? 'sprout' : 'ripe'),
    rows: rows === 'x' || rows === 'z' ? rows : rowsOfRotation(rotation),
    edge: edge && EDGES.has(edge) ? (edge as FarmEdge) : 'ridge',
  };
}

export const readTilePlot = (tile: Pick<TileConfig, 'objectConfig' | 'rotation'>): FarmPlot =>
  readFarmPlot(tile.objectConfig?.farm, tile.rotation);

/** Tiles with the same key join into one bed. */
export const plotKey = ({ soil, crop, stage, rows, edge }: FarmPlot): string => `${soil}|${crop}|${stage}|${rows}|${edge}`;

/** Row spacing of a plot: its crop's, or a bare bed's. */
export const plotRow = (plot: FarmPlot): number => (plot.crop === 'none' ? BARE_ROW : CROPS[plot.crop].row);
