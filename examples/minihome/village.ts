import type { BuildingSerializedState, PlacedObject, TileConfig, WallConfig } from 'gaesup-world/building';

const CELL = 4;
const SIDE = 12;
const HALF = (SIDE * CELL) / 2;

type Surface = NonNullable<TileConfig['objectType']> | 'path';

/** Deterministic cozy village: grass terraces, a pond with a sand shore, a stone path, one cottage and trees. */
function surfaceAt(x: number, z: number): Surface {
  if (x >= 7 && x <= 9 && z >= 2 && z <= 4) return 'water';
  if (x >= 6 && x <= 10 && z >= 1 && z <= 5) return 'sand';
  if (x === 5 || z === 7) return 'path';
  return 'grass';
}

const at = (index: number) => index * CELL - HALF + CELL / 2;

export function createVillage(): BuildingSerializedState {
  const tiles: TileConfig[] = [];
  for (let z = 0; z < SIDE; z++) {
    for (let x = 0; x < SIDE; x++) {
      const surface = surfaceAt(x, z);
      tiles.push({
        id: `tile-${x}-${z}`,
        tileGroupId: 'ground',
        size: 1,
        position: { x: at(x), y: 0, z: at(z) },
        ...(surface === 'path' ? { materialId: 'path' } : { objectType: surface }),
      });
    }
  }
  const walls: WallConfig[] = [];
  const cottage = (id: string, x: number, z: number, rotation: number, wallKind?: WallConfig['wallKind']) =>
    walls.push({ id, wallGroupId: 'cottage', position: { x, y: 0, z }, rotation: { x: 0, y: rotation, z: 0 }, ...(wallKind ? { wallKind } : {}) });
  cottage('cottage-front', at(1), at(1) + CELL / 2, 0, 'door');
  cottage('cottage-back', at(1), at(1) - CELL / 2, 0, 'window');
  cottage('cottage-left', at(1) - CELL / 2, at(1), Math.PI / 2);
  cottage('cottage-right', at(1) + CELL / 2, at(1), Math.PI / 2, 'window');

  const objects: PlacedObject[] = [
    { id: 'oak-1', type: 'tree', position: { x: at(0), y: 0, z: at(10) } },
    { id: 'oak-2', type: 'tree', position: { x: at(3), y: 0, z: at(11) } },
    { id: 'sakura-1', type: 'sakura', position: { x: at(10), y: 0, z: at(9) } },
    { id: 'sakura-2', type: 'sakura', position: { x: at(8), y: 0, z: at(11) } },
    { id: 'campfire', type: 'fire', position: { x: at(3), y: 0, z: at(5) } },
    { id: 'flag', type: 'flag', position: { x: at(6), y: 0, z: at(8) } },
  ];

  return {
    version: 1,
    meshes: [
      { id: 'ground', color: '#8fbf5a' },
      { id: 'path', color: '#c8b28a' },
      { id: 'cottage-wall', color: '#f3e3c3' },
    ],
    tileGroups: [{ id: 'ground', name: 'ground', floorMeshId: 'ground', tiles }],
    wallGroups: [{ id: 'cottage', name: 'cottage', frontMeshId: 'cottage-wall', backMeshId: 'cottage-wall', sideMeshId: 'cottage-wall', walls }],
    blocks: [],
    objects,
    showSnow: false,
    showFog: false,
    fogColor: '#dff1ff',
    weatherEffect: 'none',
    worldSurface: 'ground',
  };
}
