import { create } from 'zustand';
import * as THREE from 'three';

import {
  createPersistenceSliceWithOptions,
  type GaesupStores,
  type PersistenceState,
} from '../persistenceSlice';
import { createCameraPlugin } from '../../../camera';
import { createGaesupRuntime } from '../../../runtime';
import { SaveSystem } from '../../../save';
import type { SaveAdapter, SaveBlob } from '../../../save';
import { useGaesupStore } from '../../../stores/gaesupStore';
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

class MemorySaveAdapter implements SaveAdapter {
  saved = new Map<string, SaveBlob>();

  async read(slot: string) {
    return this.saved.get(slot) ?? null;
  }

  async write(slot: string, blob: SaveBlob) {
    this.saved.set(slot, JSON.parse(JSON.stringify(blob)) as SaveBlob);
  }

  async list() {
    return Array.from(this.saved.keys());
  }

  async remove(slot: string) {
    this.saved.delete(slot);
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

  it('does not read window globals when stores are not injected', async () => {
    const manager = new MemorySaveLoadManager();
    const stores = createStores();
    const windowWithLegacyStores = window as Window & { __gaesupStores?: GaesupStores };
    windowWithLegacyStores.__gaesupStores = stores;
    const store = create<PersistenceState>()(
      createPersistenceSliceWithOptions({
        saveLoadManager: manager as never,
      }),
    );

    await expect(store.getState().saveWorld('world', 'World')).rejects.toThrow('Building store not initialized');

    expect(manager.savedWorld).toBeNull();
    delete windowWithLegacyStores.__gaesupStores;
  });

  it('saves and loads world domains through SaveSystem without injected stores', async () => {
    const adapter = new MemorySaveAdapter();
    const saveSystem = new SaveSystem({ adapter });
    let buildingDomain = {
      version: 1,
      meshes: [],
      wallGroups: [],
      tileGroups: [],
      blocks: [{
        id: 'block-save-system',
        position: { x: 3, y: 0, z: 5 },
      }],
      objects: [],
    };
    let npcDomain = {
      version: 1,
      instances: [{
        id: 'npc-save-system',
        templateId: 'ally',
        name: 'Saved NPC',
        position: [1, 0, 2],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }],
    };
    let cameraDomain = {
      cameraOption: {
        position: { x: 1, y: 2, z: 3 },
        target: { x: 0, y: 0, z: 0 },
      },
      mode: { control: 'thirdPerson' },
    };
    saveSystem.register({
      key: 'building',
      serialize: () => buildingDomain,
      hydrate: (data) => {
        buildingDomain = data as typeof buildingDomain;
      },
    });
    saveSystem.register({
      key: 'npc',
      serialize: () => npcDomain,
      hydrate: (data) => {
        npcDomain = data as typeof npcDomain;
      },
    });
    saveSystem.register({
      key: 'camera',
      serialize: () => cameraDomain,
      hydrate: (data) => {
        cameraDomain = data as typeof cameraDomain;
      },
    });
    const now = jest.spyOn(Date, 'now').mockReturnValue(123);
    const store = create<PersistenceState>()(
      createPersistenceSliceWithOptions({ saveSystem }),
    );

    await store.getState().saveWorld('world', 'World');
    buildingDomain = { ...buildingDomain, blocks: [] };
    npcDomain = { ...npcDomain, instances: [] };
    cameraDomain = {
      cameraOption: {
        position: { x: 9, y: 9, z: 9 },
        target: { x: 0, y: 0, z: 0 },
      },
      mode: { control: 'firstPerson' },
    };

    const loaded = await store.getState().loadWorld('world_123');

    expect(store.getState().currentSaveId).toBe('world_123');
    expect(store.getState().saves).toEqual([{ id: 'world_123', timestamp: 123 }]);
    expect(buildingDomain.blocks).toEqual([expect.objectContaining({ id: 'block-save-system' })]);
    expect(npcDomain.instances).toEqual([expect.objectContaining({ id: 'npc-save-system' })]);
    expect(cameraDomain.cameraOption.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(loaded?.world).toEqual(expect.objectContaining({
      id: 'world',
      name: 'world',
      buildings: expect.objectContaining({
        blocks: [expect.objectContaining({ id: 'block-save-system' })],
      }),
      npcs: [expect.objectContaining({
        id: 'npc-save-system',
        name: 'Saved NPC',
        position: { x: 1, y: 0, z: 2 },
      })],
      camera: expect.objectContaining({
        position: { x: 1, y: 2, z: 3 },
        mode: 'thirdPerson',
      }),
    }));

    now.mockRestore();
  });

  it('projects the camera plugin save binding into world persistence data', async () => {
    const saveSystem = new SaveSystem({ adapter: new MemorySaveAdapter() });
    const runtime = createGaesupRuntime({
      saveSystem,
      plugins: [createCameraPlugin()],
    });
    const originalMode = useGaesupStore.getState().mode;
    const originalCameraOption = useGaesupStore.getState().cameraOption;
    const now = jest.spyOn(Date, 'now').mockReturnValue(987);
    const store = create<PersistenceState>()(
      createPersistenceSliceWithOptions({ saveSystem }),
    );

    try {
      await runtime.setup();
      useGaesupStore.getState().setMode({ type: 'character', control: 'thirdPerson' });
      useGaesupStore.getState().setCameraOption({
        zoom: 1.75,
        position: new THREE.Vector3(4, 5, 6),
        target: new THREE.Vector3(1, 2, 3),
      });

      await store.getState().saveWorld('camera-world', 'Camera World');

      useGaesupStore.getState().setMode({ type: 'vehicle', control: 'isometric' });
      useGaesupStore.getState().setCameraOption({
        zoom: 3,
        position: new THREE.Vector3(9, 9, 9),
        target: new THREE.Vector3(0, 0, 0),
      });

      const loaded = await store.getState().loadWorld('camera-world_987');

      expect(loaded?.world.camera).toEqual(expect.objectContaining({
        position: { x: 4, y: 5, z: 6 },
        mode: 'thirdPerson',
        settings: expect.objectContaining({
          zoom: 1.75,
          position: { x: 4, y: 5, z: 6 },
          target: { x: 1, y: 2, z: 3 },
        }),
      }));
      expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({
        zoom: 1.75,
        position: expect.objectContaining({ x: 4, y: 5, z: 6 }),
        target: expect.objectContaining({ x: 1, y: 2, z: 3 }),
      }));
    } finally {
      useGaesupStore.getState().setMode(originalMode);
      useGaesupStore.getState().setCameraOption(originalCameraOption);
      await runtime.dispose();
      now.mockRestore();
    }
  });

  it('loads SaveSystem file exports without injected stores', async () => {
    const saveSystem = new SaveSystem({ adapter: new MemorySaveAdapter() });
    let timeDomain = { version: 1, totalMinutes: 480 };
    saveSystem.register({
      key: 'time',
      serialize: () => timeDomain,
      hydrate: (data) => {
        timeDomain = data as typeof timeDomain;
      },
    });
    const fileData = {
      kind: 'gaesup.save-system',
      version: 1,
      worldId: 'file-world',
      worldName: 'File World',
      metadata: {
        description: 'from file',
      },
      blob: {
        version: 1,
        savedAt: 456,
        domains: {
          time: { version: 1, totalMinutes: 1234 },
        },
      },
    };
    const file = {
      name: 'file-world.json',
      text: async () => JSON.stringify(fileData),
    } as File;
    const store = create<PersistenceState>()(
      createPersistenceSliceWithOptions({ saveSystem }),
    );

    const loaded = await store.getState().loadFromFile(file);

    expect(timeDomain).toEqual({ version: 1, totalMinutes: 1234 });
    expect(loaded).toEqual(expect.objectContaining({
      version: '1',
      timestamp: 456,
      metadata: expect.objectContaining({
        description: 'from file',
        createdAt: 456,
        updatedAt: 456,
      }),
      world: expect.objectContaining({
        id: 'file-world',
        name: 'File World',
      }),
    }));
  });
});
