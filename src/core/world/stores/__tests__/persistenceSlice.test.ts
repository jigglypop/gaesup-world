import { create } from 'zustand';

import {
  createPersistenceSliceWithOptions,
  type GaesupStores,
  type PersistenceState,
} from '../persistenceSlice';
import type { SaveData, SaveLoadOptions, SaveLoadResult, SaveMetadata, WorldSaveData } from '../../persistence/types';

class MemorySaveLoadManager {
  savedWorld: WorldSaveData | null = null;
  savedFileWorld: WorldSaveData | null = null;
  loaded: SaveData | null = null;
  saves: Array<{ id: string; timestamp: number; metadata?: SaveMetadata }> = [];
  deleted: string | null = null;

  async save(
    worldData: WorldSaveData,
    metadata?: Partial<SaveMetadata>,
    _options: SaveLoadOptions = {},
  ): Promise<SaveLoadResult> {
    this.savedWorld = worldData;
    const data = {
      version: '1.0.0',
      timestamp: 123,
      world: worldData,
      ...(metadata ? {
        metadata: {
          ...metadata,
          createdAt: metadata.createdAt ?? 1,
          updatedAt: 2,
        },
      } : {}),
    } satisfies SaveData;
    this.loaded = data;
    this.saves = [{ id: `${worldData.id}_${data.timestamp}`, timestamp: data.timestamp }];
    return { success: true, data };
  }

  async load(_saveId: string, _options: SaveLoadOptions = {}): Promise<SaveLoadResult> {
    return this.loaded
      ? { success: true, data: this.loaded }
      : { success: false, error: 'missing' };
  }

  async saveToFile(
    worldData: WorldSaveData,
    _filename: string,
    _metadata?: Partial<SaveMetadata>,
    _options: SaveLoadOptions = {},
  ): Promise<SaveLoadResult> {
    this.savedFileWorld = worldData;
    return {
      success: true,
      data: {
        version: '1.0.0',
        timestamp: 456,
        world: worldData,
      },
    };
  }

  async loadFromFile(_file: File, _options: SaveLoadOptions = {}): Promise<SaveLoadResult> {
    return this.loaded
      ? { success: true, data: this.loaded }
      : { success: false, error: 'missing' };
  }

  listSaves() {
    return this.saves;
  }

  deleteSave(saveId: string) {
    this.deleted = saveId;
    return true;
  }
}

function createStores(): GaesupStores {
  const buildingState = {
    wallGroups: new Map([
      ['wall-group', {
        id: 'wall-group',
        name: 'Wall Group',
        walls: [],
      }],
    ]),
    tileGroups: new Map([
      ['tile-group', {
        id: 'tile-group',
        name: 'Tile Group',
        tiles: [],
      }],
    ]),
    meshes: new Map([
      ['mesh', {
        id: 'mesh',
        color: '#fff',
        material: 'STANDARD',
      }],
    ]),
    blocks: [
      {
        id: 'block',
        position: { x: 1, y: 2, z: 3 },
      },
    ],
    hydrated: null as WorldSaveData['buildings'] | null,
    hydrate(data: WorldSaveData['buildings']) {
      this.hydrated = data;
    },
  };
  const npcState = {
    instances: new Map([
      ['npc', {
        id: 'npc',
        name: 'NPC',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      }],
    ]),
  };
  const cameraState = {
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0.5, z: 0 },
    mode: 'topDown',
    settings: { zoom: 1.2 },
  };

  return {
    buildingStore: { getState: () => buildingState },
    npcStore: { getState: () => npcState },
    cameraStore: {
      getState: () => cameraState,
      setState: (state) => Object.assign(cameraState, state),
    },
  };
}

function createStore(stores: GaesupStores, manager = new MemorySaveLoadManager()) {
  return {
    manager,
    store: create<PersistenceState>()(
      createPersistenceSliceWithOptions({
        getStores: () => stores,
        saveLoadManager: manager as never,
      }),
    ),
  };
}

describe('persistenceSlice', () => {
  it('saves world data from injected stores without window globals', async () => {
    const stores = createStores();
    const { manager, store } = createStore(stores);

    await store.getState().saveWorld('world', 'World');

    expect(manager.savedWorld).toEqual({
      id: 'world',
      name: 'World',
      buildings: {
        wallGroups: Array.from(stores.buildingStore!.getState().wallGroups.values()),
        tileGroups: Array.from(stores.buildingStore!.getState().tileGroups.values()),
        blocks: stores.buildingStore!.getState().blocks,
        meshes: Array.from(stores.buildingStore!.getState().meshes.values()),
      },
      npcs: Array.from(stores.npcStore!.getState().instances.values()),
      environment: {
        lighting: {
          ambientIntensity: 1,
          directionalIntensity: 1,
          directionalPosition: { x: 0, y: 10, z: 0 },
        },
      },
      camera: stores.cameraStore!.getState(),
    });
    expect(store.getState().currentSaveId).toBe('world_123');
  });

  it('hydrates injected stores when loading world data', async () => {
    const stores = createStores();
    const { manager, store } = createStore(stores);

    await store.getState().saveWorld('world', 'World');
    stores.cameraStore!.setState({
      position: { x: 9, y: 9, z: 9 },
      mode: 'firstPerson',
    });

    const loaded = await store.getState().loadWorld('world_123');

    expect(loaded?.world.id).toBe('world');
    expect(stores.buildingStore!.getState().hydrated).toEqual(manager.savedWorld?.buildings);
    expect(stores.npcStore!.getState().instances.has('npc')).toBe(true);
    expect(stores.cameraStore!.getState()).toEqual({
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0.5, z: 0 },
      mode: 'topDown',
      settings: { zoom: 1.2 },
    });
  });
});
