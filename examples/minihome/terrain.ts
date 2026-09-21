export const WORLD_SIZE = 24;
export const WORLD_HALF = WORLD_SIZE / 2;
export const TILES = {
  grass: { name: '잔디', color: '#87ad75', walkable: true },
  snow: { name: '눈', color: '#e3edf4', walkable: true },
  sand: { name: '모래', color: '#eacb8a', walkable: true },
  water: { name: '바다', color: '#4da7b9', walkable: false },
  stone: { name: '돌길', color: '#acbab5', walkable: true },
  wood: { name: '나무', color: '#bd9472', walkable: true },
} as const;
export type TileKind = keyof typeof TILES;
export type RoomTerrain = { size: typeof WORLD_SIZE; tiles: TileKind[] };
export type EditorTool = 'select' | 'tile' | 'furniture';
export type RoomEditor = { tool: EditorTool; tile: TileKind; furniture: import('./types').FurnitureKind; brush: number; grid: boolean; snap: boolean };

export const DEFAULT_EDITOR: RoomEditor = { tool: 'select', tile: 'grass', furniture: 'plant', brush: 1, grid: true, snap: true };
export function tileIndex(x: number, z: number): number {
  const col = Math.floor(x + WORLD_HALF); const row = Math.floor(z + WORLD_HALF);
  return col < 0 || row < 0 || col >= WORLD_SIZE || row >= WORLD_SIZE ? -1 : row * WORLD_SIZE + col;
}
export function tilePosition(index: number): [number, number, number] {
  return [index % WORLD_SIZE - WORLD_HALF + 0.5, 0, Math.floor(index / WORLD_SIZE) - WORLD_HALF + 0.5];
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
  return terrain.size === WORLD_SIZE && Array.isArray(terrain.tiles) && terrain.tiles.length === WORLD_SIZE ** 2 && terrain.tiles.every(tile => typeof tile === 'string' && Object.hasOwn(TILES, tile));
}
export function paintTiles(terrain: RoomTerrain, indices: readonly number[], kind: TileKind): RoomTerrain {
  const tiles = [...terrain.tiles];
  for (const index of indices) if (Number.isInteger(index) && index >= 0 && index < tiles.length) tiles[index] = kind;
  return { size: WORLD_SIZE, tiles };
}
export function brushIndices(index: number, brush: number): number[] {
  if (index < 0 || index >= WORLD_SIZE ** 2) return [];
  const radius = Math.floor(brush / 2); const row = Math.floor(index / WORLD_SIZE); const col = index % WORLD_SIZE;
  const result: number[] = [];
  for (let z = Math.max(0, row - radius); z <= Math.min(WORLD_SIZE - 1, row + radius); z++) {
    for (let x = Math.max(0, col - radius); x <= Math.min(WORLD_SIZE - 1, col + radius); x++) result.push(z * WORLD_SIZE + x);
  }
  return result;
}
export function tileAt(terrain: RoomTerrain, x: number, z: number): TileKind | undefined { return terrain.tiles[tileIndex(x, z)]; }
