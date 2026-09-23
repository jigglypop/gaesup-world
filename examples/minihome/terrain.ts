export const WORLD_SIZE = 24;
export const WORLD_HALF = WORLD_SIZE / 2;
export const MAX_WORLD_SIZE = 64;
export const WORLD_EXPANSION = 8;
export const TILES = {
  grass: { name: '잔디', color: '#87ad75', walkable: true },
  snow: { name: '눈', color: '#e3edf4', walkable: true },
  sand: { name: '모래', color: '#eacb8a', walkable: true },
  water: { name: '바다', color: '#4da7b9', walkable: false },
  stone: { name: '돌길', color: '#acbab5', walkable: true },
  wood: { name: '나무', color: '#bd9472', walkable: true },
} as const;
export type TileKind = keyof typeof TILES;
export type StairDirection = 'north' | 'east' | 'south' | 'west';
export type TerrainShape = { height: number; stair: StairDirection | null };
export type RoomTerrain = { size: number; tiles: TileKind[]; heights?: number[]; stairs?: Array<StairDirection | null> };
export type EditorTool = 'select' | 'tile' | 'furniture' | 'height' | 'stairs';
export type RoomEditor = { tool: EditorTool; tile: TileKind; furniture: import('./types').FurnitureKind; brush: number; grid: boolean; snap: boolean; height: number; stair: StairDirection | null };

export const DEFAULT_EDITOR: RoomEditor = { tool: 'select', tile: 'grass', furniture: 'plant', brush: 1, grid: true, snap: true, height: 0.5, stair: 'north' };
export function terrainHeight(terrain: RoomTerrain, x: number, z: number): number {
  const index = tileIndex(x, z, terrain.size); if (index < 0) return 0;
  const base = terrain.heights?.[index] ?? 0; const stair = terrain.stairs?.[index]; if (!stair) return base;
  const [cx, , cz] = tilePosition(index, terrain.size);
  const progress = stair === 'north' ? 0.5 - (z - cz) : stair === 'south' ? 0.5 + z - cz : stair === 'east' ? 0.5 + x - cx : 0.5 - (x - cx);
  return base + Math.min(4, Math.max(1, Math.floor(progress * 4) + 1)) * 0.125;
}
export function sculptTerrain(terrain: RoomTerrain, indices: readonly number[], shape: TerrainShape): RoomTerrain {
  const heights = terrain.heights ? [...terrain.heights] : Array<number>(terrain.tiles.length).fill(0);
  const stairs = terrain.stairs ? [...terrain.stairs] : Array<StairDirection | null>(terrain.tiles.length).fill(null);
  for (const index of indices) if (Number.isInteger(index) && index >= 0 && index < heights.length && terrain.tiles[index] !== 'water') {
    heights[index] = shape.height; stairs[index] = shape.stair;
  }
  return { ...terrain, heights, stairs };
}
export function applyTerrainBrush(terrain: RoomTerrain, indices: readonly number[], editor: RoomEditor): RoomTerrain {
  return editor.tool === 'tile' ? paintTiles(terrain, indices, editor.tile) : sculptTerrain(terrain, indices, { height: editor.height, stair: editor.tool === 'stairs' ? editor.stair : null });
}
/** A walkable two-level garden, only applied to new homes or by an explicit editor action. */
export function terraceTerrain(terrain: RoomTerrain): RoomTerrain {
  const tiles = [...terrain.tiles]; const heights = Array<number>(tiles.length).fill(0);
  const stairs = Array<StairDirection | null>(tiles.length).fill(null);
  tiles.forEach((kind, index) => {
    if (kind === 'water') return;
    const [x, , z] = tilePosition(index, terrain.size);
    if (x >= -11 && x < -3 && z >= -10 && z < -3) heights[index] = 0.5;
    if (x > 3 && x < 10 && z >= -10 && z < -3) heights[index] = 1;
    if (x < -5 && z > 3) heights[index] = 0.5;
    if (x >= -8 && x < -5 && z === -2.5 || x > 5 && x < 8 && (z === -1.5 || z === -2.5)) {
      stairs[index] = 'north'; heights[index] = x > 5 && z === -2.5 ? 0.5 : 0; tiles[index] = 'stone';
    }
    if (x === -4.5 && z > 5 && z < 8) { stairs[index] = 'west'; tiles[index] = 'stone'; }
  });
  return { ...terrain, tiles, heights, stairs };
}
export function tileIndex(x: number, z: number, size = WORLD_SIZE): number {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return -1;
  const col = Math.floor(x + size / 2); const row = Math.floor(z + size / 2);
  return col < 0 || row < 0 || col >= size || row >= size ? -1 : row * size + col;
}
export function tilePosition(index: number, size = WORLD_SIZE): [number, number, number] {
  return [index % size - size / 2 + 0.5, 0, Math.floor(index / size) - size / 2 + 0.5];
}
export function createTerrain(): RoomTerrain {
  return { size: WORLD_SIZE, tiles: Array.from({ length: WORLD_SIZE * WORLD_SIZE }, (_, index) => {
    const [x, , z] = tilePosition(index);
    if (x > 8 && z > 3) return 'water';
    if (x > 4 && z > 3) return 'sand';
    if (x < -5 && z > 3) return 'snow';
    if (x < -3 && z < -3 && x > -11 && z > -10) return 'wood';
    if (x > 3 && z < -3 && x < 10 && z > -10) return 'wood';
    if (Math.abs(x) < 1 || Math.abs(z) < 1 || Math.abs(x) < 4 && Math.abs(z) < 4) return 'stone';
    return 'grass';
  }) };
}
export function isTerrain(value: unknown): value is RoomTerrain {
  if (!value || typeof value !== 'object') return false;
  const terrain = value as RoomTerrain;
  return Number.isInteger(terrain.size) && terrain.size >= WORLD_SIZE && terrain.size <= MAX_WORLD_SIZE && (terrain.size - WORLD_SIZE) % WORLD_EXPANSION === 0 && Array.isArray(terrain.tiles) && terrain.tiles.length === terrain.size ** 2 && terrain.tiles.every(tile => typeof tile === 'string' && Object.hasOwn(TILES, tile))
    && (terrain.heights === undefined || Array.isArray(terrain.heights) && terrain.heights.length === terrain.tiles.length && terrain.heights.every(h => Number.isFinite(h) && h >= 0 && h <= 4 && Number.isInteger(h * 2)))
    && (terrain.stairs === undefined || Array.isArray(terrain.stairs) && terrain.stairs.length === terrain.tiles.length && terrain.stairs.every(s => s === null || ['north', 'east', 'south', 'west'].includes(s)));
}
export function paintTiles(terrain: RoomTerrain, indices: readonly number[], kind: TileKind): RoomTerrain {
  const tiles = [...terrain.tiles];
  for (const index of indices) if (Number.isInteger(index) && index >= 0 && index < tiles.length) tiles[index] = kind;
  const next = { ...terrain, tiles };
  if (kind === 'water') { if (next.heights) next.heights = next.heights.map((h, i) => tiles[i] === 'water' ? 0 : h); if (next.stairs) next.stairs = next.stairs.map((s, i) => tiles[i] === 'water' ? null : s); }
  return next;
}
/** Expand around the existing origin so furniture, paths and shared positions stay stable. */
export function expandTerrain(terrain: RoomTerrain, fill: TileKind = 'grass'): RoomTerrain {
  if (terrain.size >= MAX_WORLD_SIZE) return terrain;
  const size = terrain.size + WORLD_EXPANSION;
  const tiles: TileKind[] = Array(size * size).fill(fill);
  const offset = WORLD_EXPANSION / 2;
  const heights = terrain.heights ? Array<number>(size * size).fill(0) : undefined;
  const stairs = terrain.stairs ? Array<StairDirection | null>(size * size).fill(null) : undefined;
  for (let row = 0; row < terrain.size; row++) {
    for (let col = 0; col < terrain.size; col++) {
      const to = (row + offset) * size + col + offset; const from = row * terrain.size + col;
      tiles[to] = terrain.tiles[from]!; if (heights) heights[to] = terrain.heights![from]!; if (stairs) stairs[to] = terrain.stairs![from]!;
    }
  }
  return { size, tiles, ...(heights ? { heights } : {}), ...(stairs ? { stairs } : {}) };
}
export function brushIndices(index: number, brush: number, size = WORLD_SIZE): number[] {
  if (!Number.isInteger(index) || index < 0 || index >= size ** 2) return [];
  const radius = Math.floor(brush / 2); const row = Math.floor(index / size); const col = index % size;
  const result: number[] = [];
  for (let z = Math.max(0, row - radius); z <= Math.min(size - 1, row + radius); z++) {
    for (let x = Math.max(0, col - radius); x <= Math.min(size - 1, col + radius); x++) result.push(z * size + x);
  }
  return result;
}
export function tileAt(terrain: RoomTerrain, x: number, z: number): TileKind | undefined { return terrain.tiles[tileIndex(x, z, terrain.size)]; }
