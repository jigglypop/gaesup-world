import { SaveLoadManager } from '../SaveLoadManager';
import type { WorldSaveData } from '../types';

function createWorld(blocks: NonNullable<WorldSaveData['buildings']['blocks']>): WorldSaveData {
  return {
    id: 'world',
    name: 'World',
    buildings: {
      wallGroups: [],
      tileGroups: [],
      meshes: [],
      blocks,
    },
    npcs: [],
    environment: {
      lighting: {
        ambientIntensity: 1,
        directionalIntensity: 1,
        directionalPosition: { x: 0, y: 10, z: 0 },
      },
    },
  };
}

describe('SaveLoadManager building blocks', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(Date, 'now').mockReturnValue(1234);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('saves and loads voxel block data with building payloads', async () => {
    const manager = new SaveLoadManager();
    const result = await manager.save(createWorld([
      {
        id: 'block-1',
        position: { x: 4, y: 0, z: 8 },
        cell: { x: 1, z: 2, level: 0 },
        size: { x: 1, y: 2, z: 1 },
        materialId: 'stone',
        tags: ['wall'],
      },
    ]));

    expect(result.success).toBe(true);
    expect(result.data?.world.buildings.blocks).toEqual([
      expect.objectContaining({
        id: 'block-1',
        materialId: 'stone',
        tags: ['wall'],
      }),
    ]);

    const loaded = await manager.load('world_1234');
    expect(loaded.success).toBe(true);
    expect(loaded.data?.world.buildings.blocks?.[0]?.size).toEqual({ x: 1, y: 2, z: 1 });
  });

  test('includeBuildings false strips blocks with the rest of building data', async () => {
    const manager = new SaveLoadManager();
    const result = await manager.save(
      createWorld([{ id: 'block-1', position: { x: 0, y: 0, z: 0 } }]),
      undefined,
      { includeBuildings: false },
    );

    expect(result.success).toBe(true);
    expect(result.data?.world.buildings).toEqual({
      wallGroups: [],
      tileGroups: [],
      blocks: [],
      meshes: [],
    });
  });
});
