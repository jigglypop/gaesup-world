import * as THREE from 'three';

import { cellSpan } from '../model/footprint';
import type { BuildingWorldSurface, TileConfig, TileGroupConfig } from '../types';
import { TILE_CONSTANTS } from '../types/constants';

const CELL = TILE_CONSTANTS.GRID_CELL_SIZE;
/** Binomial 7-tap kernel (1 6 15 20 15 6 1) / 64, run once along each axis. */
const KERNEL = [1, 6, 15, 20, 15, 6, 1].map((weight) => weight / 64);
const RADIUS = 3;
const EMPTY = 255;
/** Texels a slice blurs before it checks the clock, so one slice overshoots its budget by a fraction of a millisecond. */
const TEXELS_PER_STEP = 16_384;
/** Meters of distance to land the field's G channel spans: G = min(distance / SHORE_DISTANCE_RANGE, 1). */
export const SHORE_DISTANCE_RANGE = 64;

export type ShoreFieldSource = {
  tileGroups: Iterable<Pick<TileGroupConfig, 'tiles'>>;
  /** `water`: cells without a tile are open sea. */
  worldSurface?: BuildingWorldSurface;
};

export type ShoreFieldOptions = {
  /** Texels along one grid cell; 4 gives 1m texels. */
  texelsPerCell?: number;
  /** Cells of open border around the tiles, wide enough for the blur to fade out. */
  margin?: number;
  /** Longest texture side; large worlds get fewer texels per cell. */
  maxSize?: number;
};

const DEFAULTS: Required<ShoreFieldOptions> = { texelsPerCell: 4, margin: 2, maxSize: 2048 };

/**
 * Water coverage around the building grid, blurred across every shoreline so ground and water shaders can blend by
 * distance instead of switching per tile: 0 on land, 1 on open water and 0.5 on the shoreline itself.
 * The RGBA8 texture keeps coverage in R, the distance from water to the nearest land in G (a fraction of
 * {@link SHORE_DISTANCE_RANGE} meters, 0 on land) and A = 1; sample it at `(world.xz - transform.xy) * transform.zw`.
 * Rebuilds write into the same texture and transform, so materials that bound them stay valid.
 */
export class ShoreField {
  readonly texture: THREE.DataTexture;
  /** World xz to texture uv: `uv = (xz - (x, y)) * (z, w)`. */
  readonly transform = new THREE.Vector4(0, 0, 1, 1);
  /** Bumped by every completed build; 0 while the field is still the open-water placeholder. */
  version = 0;
  /** Whether the world has any water: water tiles or an open sea. */
  hasWater = false;

  constructor() {
    this.texture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.needsUpdate = true;
  }

  /** Bilinear coverage (`channel` 0) or distance fraction (1) at a world point, matching what the GPU samples. */
  sample(x: number, z: number, channel = 0): number {
    const { data, width, height } = this.texture.image as { data: Uint8Array; width: number; height: number };
    const u = Math.min(Math.max((x - this.transform.x) * this.transform.z * width - 0.5, 0), width - 1);
    const v = Math.min(Math.max((z - this.transform.y) * this.transform.w * height - 0.5, 0), height - 1);
    const x0 = Math.floor(u);
    const z0 = Math.floor(v);
    const x1 = Math.min(x0 + 1, width - 1);
    const z1 = Math.min(z0 + 1, height - 1);
    const fx = u - x0;
    const fz = v - z0;
    const at = (tx: number, tz: number) => data[(tz * width + tx) * 4 + channel]!;
    const top = at(x0, z0) + (at(x1, z0) - at(x0, z0)) * fx;
    const bottom = at(x0, z1) + (at(x1, z1) - at(x0, z1)) * fx;
    return (top + (bottom - top) * fz) / 255;
  }

  dispose(): void {
    this.texture.dispose();
  }
}

/** Cells of the mask start `phase` meters past a whole number of cells, so cell `i` begins at `i * CELL + phase`. */
type CellMask = {
  minX: number;
  minZ: number;
  phaseX: number;
  phaseZ: number;
  columns: number;
  rows: number;
  water: Uint8Array;
  hasWater: boolean;
};

const isWaterTile = (tile: TileConfig) => tile.objectType === 'water' && (tile.shape ?? 'box') === 'box';

/**
 * Where cell edges fall along one axis: a tile's west or north edge modulo a cell. Snapped tiles give half a cell;
 * worlds laid out by hand may use another phase, which the field follows so its shoreline meets the tiles.
 */
const gridPhase = (center: number, span: number) => (((center - (span * CELL) / 2) % CELL) + CELL) % CELL;

/** First cell a tile covers along one axis. */
const firstCell = (center: number, span: number, phase: number) => Math.round((center - (span * CELL) / 2 - phase) / CELL);

/** Water (1) or land (0) per cell over the tiles' bounds plus a margin; cells without a tile follow the world surface. */
function rasterize({ tileGroups, worldSurface = 'ground' }: ShoreFieldSource, margin: number): CellMask {
  const tiles: TileConfig[] = [];
  for (const group of tileGroups) tiles.push(...group.tiles);
  const sea = worldSurface === 'water';
  if (tiles.length === 0) return { minX: 0, minZ: 0, phaseX: 0, phaseZ: 0, columns: 1, rows: 1, water: new Uint8Array([sea ? 1 : 0]), hasWater: sea };
  const phaseX = gridPhase(tiles[0]!.position.x, cellSpan(tiles[0]!.size));
  const phaseZ = gridPhase(tiles[0]!.position.z, cellSpan(tiles[0]!.size));
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const tile of tiles) {
    const span = cellSpan(tile.size);
    const x = firstCell(tile.position.x, span, phaseX);
    const z = firstCell(tile.position.z, span, phaseZ);
    minX = Math.min(minX, x);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x + span - 1);
    maxZ = Math.max(maxZ, z + span - 1);
  }
  minX -= margin;
  minZ -= margin;
  const columns = maxX - minX + 1 + margin;
  const rows = maxZ - minZ + 1 + margin;
  const water = new Uint8Array(columns * rows).fill(EMPTY);
  let hasWater = sea;
  // Land first, then water: a water tile wins a cell it shares with a raised or stacked land tile.
  for (const wet of [false, true]) {
    for (const tile of tiles) {
      if (isWaterTile(tile) !== wet) continue;
      hasWater ||= wet;
      const span = cellSpan(tile.size);
      const x0 = firstCell(tile.position.x, span, phaseX) - minX;
      const z0 = firstCell(tile.position.z, span, phaseZ) - minZ;
      for (let z = z0; z < z0 + span; z++) water.fill(wet ? 1 : 0, z * columns + x0, z * columns + x0 + span);
    }
  }
  for (let i = 0; i < water.length; i++) if (water[i] === EMPTY) water[i] = sea ? 1 : 0;
  return { minX, minZ, phaseX, phaseZ, columns, rows, water, hasWater };
}

/** Chamfer distance in texels from every texel to the nearest land texel (0 on land), in two sweeps. */
function* landDistance(mask: CellMask, perCell: number, width: number, height: number, rowsPerStep: number): Generator<void, Float32Array> {
  const distance = new Float32Array(width * height);
  for (let z = 0; z < height; z++) {
    const row = Math.floor(z / perCell) * mask.columns;
    for (let x = 0; x < width; x++) distance[z * width + x] = mask.water[row + Math.floor(x / perCell)] ? Infinity : 0;
  }
  const relax = (i: number, from: number, cost: number) => {
    const through = distance[from]! + cost;
    if (through < distance[i]!) distance[i] = through;
  };
  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const i = z * width + x;
      if (x > 0) relax(i, i - 1, 1);
      if (z === 0) continue;
      relax(i, i - width, 1);
      if (x > 0) relax(i, i - width - 1, Math.SQRT2);
      if (x < width - 1) relax(i, i - width + 1, Math.SQRT2);
    }
    if (z % rowsPerStep === rowsPerStep - 1) yield;
  }
  for (let z = height - 1; z >= 0; z--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = z * width + x;
      if (x < width - 1) relax(i, i + 1, 1);
      if (z === height - 1) continue;
      relax(i, i + width, 1);
      if (x < width - 1) relax(i, i + width + 1, Math.SQRT2);
      if (x > 0) relax(i, i + width - 1, Math.SQRT2);
    }
    if (z % rowsPerStep === 0) yield;
  }
  return distance;
}

/**
 * Rebuilds `field` from the tiles, yielding between slices of rows so a caller can spread a large world over frames.
 * The field keeps its previous contents until the last step writes the new texture, transform and version.
 */
export function* rebuildShoreField(field: ShoreField, source: ShoreFieldSource, options: ShoreFieldOptions = {}): Generator<void, void> {
  const { texelsPerCell, margin, maxSize } = { ...DEFAULTS, ...options };
  const mask = rasterize(source, margin);
  const perCell = Math.max(1, Math.min(texelsPerCell, Math.floor(maxSize / Math.max(mask.columns, mask.rows))));
  const width = mask.columns * perCell;
  const height = mask.rows * perCell;
  const rowsPerStep = Math.max(1, Math.floor(TEXELS_PER_STEP / width));

  // Texel rows inside one cell row share their mask, so the horizontal pass runs once per cell row.
  const across = new Float32Array(mask.rows * width);
  const line = new Uint8Array(width);
  for (let row = 0; row < mask.rows; row++) {
    for (let x = 0; x < width; x++) line[x] = mask.water[row * mask.columns + Math.floor(x / perCell)]!;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let d = -RADIUS; d <= RADIUS; d++) sum += line[Math.min(Math.max(x + d, 0), width - 1)]! * KERNEL[d + RADIUS]!;
      across[row * width + x] = sum;
    }
    if (row % rowsPerStep === rowsPerStep - 1) yield;
  }

  const toLand = yield* landDistance(mask, perCell, width, height, rowsPerStep);
  // The shoreline lies half a texel past the nearest land texel's center.
  const texelMeters = CELL / perCell;
  const data = new Uint8Array(width * height * 4);
  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let d = -RADIUS; d <= RADIUS; d++) {
        const row = Math.floor(Math.min(Math.max(z + d, 0), height - 1) / perCell);
        sum += across[row * width + x]! * KERNEL[d + RADIUS]!;
      }
      const offset = (z * width + x) * 4;
      data[offset] = Math.round(sum * 255);
      const meters = Math.max(0, toLand[z * width + x]! - 0.5) * texelMeters;
      data[offset + 1] = Math.round(Math.min(1, meters / SHORE_DISTANCE_RANGE) * 255);
      data[offset + 3] = 255;
    }
    if (z % rowsPerStep === rowsPerStep - 1) yield;
  }

  const texture = field.texture;
  const image = texture.image as { width: number; height: number };
  // A texture's GPU storage has a fixed size; releasing it lets the next upload allocate the new one.
  if (image.width !== width || image.height !== height) texture.dispose();
  texture.image = { data, width, height };
  texture.needsUpdate = true;
  field.transform.set(mask.minX * CELL + mask.phaseX, mask.minZ * CELL + mask.phaseZ, 1 / (mask.columns * CELL), 1 / (mask.rows * CELL));
  field.hasWater = mask.hasWater;
  field.version += 1;
}

/** Builds a shore field in one go; `rebuildShoreField` spreads the same work over frames. */
export function createShoreField(source: ShoreFieldSource, options?: ShoreFieldOptions): ShoreField {
  const field = new ShoreField();
  const steps = rebuildShoreField(field, source, options);
  while (!steps.next().done);
  return field;
}
