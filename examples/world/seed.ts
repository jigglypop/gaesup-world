import type { BuildingSerializedState, PlacedObject, TileConfig, TileGroupConfig, TileObjectType, WallGroupConfig } from 'gaesup-world/building';

export type PerfWorldSize = 's' | 'm' | 'l';
export type PerfWorldOptions = {
  /** Tiles per side of each water patch, from its corner; 0 removes water. Defaults to the whole patch. */
  waterSide?: number;
  /** Every fifth wall has a window: the non-instanced wall path. Defaults to true. */
  windows?: boolean;
};

/** Tile patches per side and tiles per patch side for each benchmark size. */
const SIZES: Record<PerfWorldSize, { patches: number; side: number; objectsPerPatch: number }> = {
  s: { patches: 3, side: 10, objectsPerPatch: 4 },
  m: { patches: 5, side: 20, objectsPerPatch: 8 },
  l: { patches: 8, side: 25, objectsPerPatch: 12 },
};
const CELL = 4;
const PATCH_GAP = 8;
const SURFACES: TileObjectType[] = ['none', 'grass', 'none', 'water', 'none', 'sand'];
const OBJECTS: PlacedObject['type'][] = ['tree', 'fire', 'flag', 'sakura'];

export function parsePerfWorldSize(value: string | null): PerfWorldSize {
  return value === 's' || value === 'l' ? value : 'm';
}

/** Deterministic building world for frame-harness and /accept runs: no randomness, identical across runs and machines. */
export function createPerfWorld(size: PerfWorldSize, { waterSide, windows = true }: PerfWorldOptions = {}): BuildingSerializedState {
  const { patches, side, objectsPerPatch } = SIZES[size];
  const water = Math.min(side, Math.max(0, waterSide ?? side));
  const span = side * CELL + PATCH_GAP;
  const origin = -(patches * span) / 2;
  const tileGroups: TileGroupConfig[] = [];
  const wallGroups: WallGroupConfig[] = [];
  const objects: PlacedObject[] = [];
  for (let pz = 0; pz < patches; pz++) {
    for (let px = 0; px < patches; px++) {
      const index = pz * patches + px;
      const x0 = origin + px * span;
      const z0 = origin + pz * span;
      const groupId = `perf-tiles-${index}`;
      const surface = SURFACES[index % SURFACES.length]!;
      const tiles: TileConfig[] = [];
      for (let tz = 0; tz < side; tz++) {
        for (let tx = 0; tx < side; tx++) {
          const objectType = surface === 'water' && (tx >= water || tz >= water) ? 'none' : surface;
          tiles.push({
            id: `${groupId}-${tx}-${tz}`, tileGroupId: groupId, size: 1,
            position: { x: x0 + tx * CELL, y: 0, z: z0 + tz * CELL },
            ...(objectType === 'none' ? {} : { objectType }),
          });
        }
      }
      tileGroups.push({ id: groupId, name: groupId, floorMeshId: 'perf-floor', tiles });
      const wallGroupId = `perf-walls-${index}`;
      wallGroups.push({
        id: wallGroupId, name: wallGroupId, frontMeshId: 'perf-wall', backMeshId: 'perf-wall', sideMeshId: 'perf-wall',
        walls: Array.from({ length: side }, (_, i) => ({
          id: `${wallGroupId}-${i}`, wallGroupId,
          position: { x: x0 + i * CELL, y: 0, z: z0 - CELL / 2 },
          rotation: { x: 0, y: 0, z: 0 },
          ...(windows && i % 5 === 2 ? { wallKind: 'window' as const } : {}),
        })),
      });
      for (let i = 0; i < objectsPerPatch; i++) {
        const cell = (i * 7) % (side * side);
        objects.push({
          id: `perf-object-${index}-${i}`, type: OBJECTS[(index + i) % OBJECTS.length]!,
          position: { x: x0 + (cell % side) * CELL, y: 0, z: z0 + Math.floor(cell / side) * CELL },
        });
      }
    }
  }
  return {
    version: 1,
    meshes: [
      { id: 'perf-floor', color: '#8ea36b' },
      { id: 'perf-wall', color: '#c9b79c' },
    ],
    wallGroups, tileGroups, blocks: [], objects,
    showSnow: false, showFog: false, fogColor: '#ffffff', weatherEffect: 'none', worldSurface: 'ground',
  };
}
