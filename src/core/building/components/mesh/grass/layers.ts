import { cellKey, neighborMask } from './field';
import { tileWorldSize } from '../../../model/footprint';
import type { GrassProfile, MeshConfig, TileConfig } from '../../../types';
import { getTileShape } from '../../TileSystem/layout';

/** Tiles per chunk side: the classic path draws 8 × 8 tiles a chunk; node layers use 4 × 4 for finer LOD and joints. */
export const LEGACY_CHUNK_TILES = 8;
export const NODE_CHUNK_TILES = 4;
/** Candidate blades per m² of mesh grass by profile; tall-grass tiles default to 90 (`objectConfig.grassDensity`). */
export const MESH_GRASS_DENSITY: Record<GrassProfile, number> = { lawn: 16, tall: 52 };
const TALL_TILE_DENSITY = 90;
/** Painted meadow ground and its blades sit this far above the tile top. */
const MEADOW_LIFT = 0.05;
/** Blade roots on a textured mesh without a grass color. */
const LAWN_TINT = '#86c460';
/** Terrain covers that keep their own surface. */
const COVERS = new Set(['water', 'sand', 'snowfield']);

/** Local x, z, tile top y and the bits of the grass-bearing neighbors (`neighborMask`). */
type Cell = [number, number, number, number];
type GroundCell = [number, number, number];
export type MeshLookup = (tile: TileConfig) => MeshConfig | undefined;

export type GrassChunk = {
  key: string;
  profile: GrassProfile;
  origin: [number, number, number];
  center: [number, number, number];
  cells: Cell[];
  cellSize: number;
  width: number;
  density: number;
  height?: number;
  /** Blades stand on the painted meadow ground; otherwise on the tile's own surface, tinted `terrainColor`. */
  painted: boolean;
  terrainColor?: string;
  terrainAccentColor?: string;
};

export type GrassGround = {
  key: string;
  origin: [number, number, number];
  cells: GroundCell[];
  cellSize: number;
  terrainColor?: string;
  terrainAccentColor?: string;
};

type Entry = Pick<GrassChunk, 'profile' | 'density' | 'height' | 'painted' | 'terrainColor' | 'terrainAccentColor'> & { tile: TileConfig };

const isTall = (tile: TileConfig) => tile.objectType === 'grass' && getTileShape(tile) === 'box';

function colors(tile: TileConfig): Pick<Entry, 'terrainColor' | 'terrainAccentColor'> {
  const { terrainColor, terrainAccentColor } = tile.objectConfig ?? {};
  return { ...(terrainColor ? { terrainColor } : {}), ...(terrainAccentColor ? { terrainAccentColor } : {}) };
}

/** The ground tint of a grass mesh's tiles: its grass color, else its color unless a texture paints it. */
function meshTint(mesh: MeshConfig): string {
  const textured = mesh.mapTextureUrl ?? mesh.textureUrl ?? mesh.materialParams?.mapTextureUrl;
  return mesh.grass?.color ?? (textured ? undefined : mesh.color ?? mesh.materialParams?.color) ?? LAWN_TINT;
}

/** Tall-grass tiles. On a mesh that grows grass they keep its surface; elsewhere they paint the meadow ground. */
function tallEntries(tiles: readonly TileConfig[], meshOf?: MeshLookup): Entry[] {
  return tiles.filter(isTall).map((tile) => {
    const mesh = meshOf?.(tile);
    const density = tile.objectConfig?.grassDensity ?? TALL_TILE_DENSITY;
    return mesh?.grass
      ? { tile, profile: 'tall', density, painted: false, terrainColor: meshTint(mesh) }
      : { tile, profile: 'tall', density, painted: true, ...colors(tile) };
  });
}

/** Box tiles whose mesh grows grass, terrain covers except grass itself left out. */
function meshEntries(tiles: readonly TileConfig[], meshOf: MeshLookup): Entry[] {
  return tiles.flatMap((tile): Entry[] => {
    const mesh = meshOf(tile);
    if (!mesh?.grass || getTileShape(tile) !== 'box' || COVERS.has(tile.objectType ?? 'none')) return [];
    const profile = mesh.grass.profile ?? 'lawn';
    const { height } = mesh.grass;
    return [{
      tile, profile, density: mesh.grass.density ?? MESH_GRASS_DENSITY[profile], ...(height !== undefined ? { height } : {}),
      painted: false, terrainColor: meshTint(mesh),
    }];
  });
}

/**
 * Square chunks of `span` tiles keyed by position, tile size, look and colors, so an edit rebuilds the chunks it touches.
 * Each cell records which neighbors in its layer bear grass, chunk seams included, for the ragged border.
 */
function chunkLayer(entries: readonly Entry[], span: number): GrassChunk[] {
  const bearing = new Set(entries.map(({ tile }) => cellKey(tile.position.x, tile.position.z)));
  const bears = (x: number, z: number) => bearing.has(cellKey(x, z));
  const chunks = new Map<string, GrassChunk>();
  for (const { tile, ...look } of entries) {
    const cellSize = tileWorldSize(tile), width = cellSize * span, { x, y, z } = tile.position;
    const cx = Math.floor(x / width), cz = Math.floor(z / width);
    const key = [look.profile, cx, cz, cellSize, look.density, look.height ?? '', look.painted ? 'meadow' : 'tile',
      look.terrainColor ?? '', look.terrainAccentColor ?? ''].join(':');
    let chunk = chunks.get(key);
    if (!chunk) {
      const origin: [number, number, number] = [(cx + 0.5) * width, look.painted ? MEADOW_LIFT : 0, (cz + 0.5) * width];
      chunk = { key, origin, center: [origin[0], 0, origin[2]], cells: [], cellSize, width, ...look };
      chunks.set(key, chunk);
    }
    chunk.cells.push([x - chunk.origin[0], z - chunk.origin[2], y, neighborMask(x, z, cellSize, bears)]);
  }
  for (const chunk of chunks.values()) chunk.center[1] = chunk.cells.reduce((sum, cell) => sum + cell[2], 0) / chunk.cells.length;
  return [...chunks.values()];
}

/**
 * Grass chunks of the tall-grass tiles and, with `meshOf`, of the tiles whose mesh grows grass. Blade density per
 * square meter is unchanged.
 */
export function groupGrassChunks(
  tiles: readonly TileConfig[],
  { meshOf, span = LEGACY_CHUNK_TILES }: { meshOf?: MeshLookup | undefined; span?: number } = {},
): GrassChunk[] {
  const tall = chunkLayer(tallEntries(tiles, meshOf), span);
  return meshOf ? [...tall, ...chunkLayer(meshEntries(tiles, meshOf), span)] : tall;
}

/**
 * The painted meadow under tall-grass tiles: one ground per tile size and color set, cells relative to the set's first
 * tile. With `meshOf`, tiles on a mesh that grows grass keep that surface instead.
 */
export function groupGrassGrounds(tiles: readonly TileConfig[], meshOf?: MeshLookup): GrassGround[] {
  const grounds = new Map<string, GrassGround>();
  for (const tile of tiles) {
    if (!isTall(tile) || meshOf?.(tile)?.grass) continue;
    const cellSize = tileWorldSize(tile);
    const tint = colors(tile);
    const key = `${cellSize}:${tint.terrainColor ?? ''}:${tint.terrainAccentColor ?? ''}`;
    let ground = grounds.get(key);
    if (!ground) {
      ground = { key, origin: [tile.position.x, MEADOW_LIFT, tile.position.z], cells: [], cellSize, ...tint };
      grounds.set(key, ground);
    }
    ground.cells.push([tile.position.x - ground.origin[0], tile.position.z - ground.origin[2], tile.position.y]);
  }
  return [...grounds.values()];
}
