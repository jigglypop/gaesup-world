import { SaveLoadManager, type LegacySaveStorage } from '../SaveLoadManager';
import type { SaveData, WorldSaveData } from '../types';

class MemoryLegacySaveStorage implements LegacySaveStorage {
  private readonly records = new Map<string, string>();

  get length(): number {
    return this.records.size;
  }

  key(index: number): string | null {
    return Array.from(this.records.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.records.set(key, value);
  }

  removeItem(key: string): void {
    this.records.delete(key);
  }
}

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

  test('can use injected legacy storage without touching localStorage', async () => {
    const storage = new MemoryLegacySaveStorage();
    const manager = new SaveLoadManager({
      storage,
      now: () => 4321,
    });

    const saved = await manager.save(createWorld([
      { id: 'block-storage', position: { x: 1, y: 0, z: 1 } },
    ]));
    const loaded = await manager.load('world_4321');

    expect(saved.success).toBe(true);
    expect(loaded.data?.world.buildings.blocks?.[0]?.id).toBe('block-storage');
    expect(manager.listSaves()).toEqual([{ id: 'world_4321', timestamp: 4321 }]);
    expect(localStorage.length).toBe(0);

    expect(manager.deleteSave('world_4321')).toBe(true);
    expect(storage.length).toBe(0);
  });

  test('compressed saves load correctly and still appear in save lists', async () => {
    const storage = new MemoryLegacySaveStorage();
    const manager = new SaveLoadManager({
      storage,
      now: () => 8765,
    });

    const saved = await manager.save(
      createWorld([{ id: 'block-compressed', position: { x: 3, y: 0, z: 3 } }]),
      { description: 'Compressed test save' },
      { compress: true },
    );
    const loaded = await manager.load('world_8765');

    expect(saved.success).toBe(true);
    expect(loaded.success).toBe(true);
    expect(loaded.data?.world.buildings.blocks?.[0]?.id).toBe('block-compressed');
    expect(manager.listSaves()).toEqual([
      {
        id: 'world_8765',
        timestamp: 8765,
        metadata: expect.objectContaining({
          description: 'Compressed test save',
          createdAt: 8765,
          updatedAt: 8765,
        }),
      },
    ]);
  });

  test('writes file exports through an injected file writer without creating a legacy save', async () => {
    const storage = new MemoryLegacySaveStorage();
    const writes: Array<{ filename: string; data: SaveData }> = [];
    const manager = new SaveLoadManager({
      storage,
      fileWriter: (filename, data) => {
        writes.push({ filename, data });
      },
      now: () => 5678,
    });

    const result = await manager.saveToFile(
      createWorld([{ id: 'block-file', position: { x: 2, y: 0, z: 2 } }]),
      'world-export',
    );

    expect(result.success).toBe(true);
    expect(writes).toEqual([
      {
        filename: 'world-export',
        data: expect.objectContaining({
          timestamp: 5678,
          world: expect.objectContaining({
            buildings: expect.objectContaining({
              blocks: [expect.objectContaining({ id: 'block-file' })],
            }),
          }),
        }) as SaveData,
      },
    ]);
    expect(storage.length).toBe(0);
  });
});
