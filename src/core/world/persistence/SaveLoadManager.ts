import { Profile, HandleError, MonitorMemory, Timeout } from '@/core/boilerplate/decorators';

import { 
  SaveData, 
  WorldSaveData, 
  SaveLoadOptions, 
  SaveLoadResult,
  SaveMetadata
} from './types';

const SAVE_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'gaesup_world_save_';

export class SaveLoadManager {
  private version: string;

  constructor() {
    this.version = SAVE_VERSION;
  }

  @HandleError()
  @Profile()
  @Timeout(5000) // 5초 타임아웃
  async save(
    worldData: WorldSaveData,
    metadata?: Partial<SaveMetadata>,
    options: SaveLoadOptions = {}
  ): Promise<SaveLoadResult> {
    try {
      const saveData: SaveData = {
        version: this.version,
        timestamp: Date.now(),
        world: this.filterWorldData(worldData, options),
        metadata: metadata ? {
          ...metadata,
          createdAt: metadata.createdAt || Date.now(),
          updatedAt: Date.now()
        } : undefined
      };

      if (options.compress) {
        return await this.saveCompressed(saveData);
      } else {
        return await this.saveUncompressed(saveData);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  @HandleError()
  @Profile()
  @Timeout(5000)
  async load(saveId: string, options: SaveLoadOptions = {}): Promise<SaveLoadResult> {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${saveId}`;
      const savedDataStr = localStorage.getItem(storageKey);

      if (!savedDataStr) {
        throw new Error(`Save data not found: ${saveId}`);
      }

      let saveData: SaveData;

      if (savedDataStr.startsWith('{')) {
        saveData = JSON.parse(savedDataStr);
      } else {
        saveData = await this.decompressData(savedDataStr);
      }

      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save data format');
      }

      return {
        success: true,
        data: {
          ...saveData,
          world: this.filterWorldData(saveData.world, options)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load save data'
      };
    }
  }

  @HandleError()
  @Profile()
  async saveToFile(
    worldData: WorldSaveData,
    filename: string,
    metadata?: Partial<SaveMetadata>,
    options: SaveLoadOptions = {}
  ): Promise<SaveLoadResult> {
    try {
      const result = await this.save(worldData, metadata, options);
      
      if (!result.success || !result.data) {
        return result;
      }

      const blob = new Blob(
        [JSON.stringify(result.data, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save file'
      };
    }
  }

  @HandleError()
  @Profile()
  async loadFromFile(file: File, options: SaveLoadOptions = {}): Promise<SaveLoadResult> {
    try {
      const text = await file.text();
      const saveData: SaveData = JSON.parse(text);

      if (!this.validateSaveData(saveData)) {
        throw new Error('Invalid save file format');
      }

      return {
        success: true,
        data: {
          ...saveData,
          world: this.filterWorldData(saveData.world, options)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load file'
      };
    }
  }

  @MonitorMemory(10)
  listSaves(): Array<{ id: string; timestamp: number; metadata?: SaveMetadata }> {
    const saves: Array<{ id: string; timestamp: number; metadata?: SaveMetadata }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const saveId = key.substring(STORAGE_KEY_PREFIX.length);
          const dataStr = localStorage.getItem(key);
          if (dataStr) {
            const data: SaveData = JSON.parse(dataStr);
            saves.push({
              id: saveId,
              timestamp: data.timestamp,
              metadata: data.metadata
            });
          }
        } catch (error) {
          console.error(`Failed to parse save: ${key}`, error);
        }
      }
    }

    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  @HandleError()
  deleteSave(saveId: string): boolean {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${saveId}`;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  @Profile()
  private filterWorldData(world: WorldSaveData, options: SaveLoadOptions): WorldSaveData {
    const filtered = { ...world };

    if (options.includeBuildings === false) {
      filtered.buildings = {
        wallGroups: [],
        tileGroups: [],
        meshes: []
      };
    }

    if (options.includeNPCs === false) {
      filtered.npcs = [];
    }

    if (options.includeEnvironment === false) {
      filtered.environment = {
        lighting: {
          ambientIntensity: 1,
          directionalIntensity: 1,
          directionalPosition: { x: 0, y: 10, z: 0 }
        }
      };
    }

    if (options.includeCamera === false) {
      delete filtered.camera;
    }

    return filtered;
  }

  @HandleError()
  private async saveUncompressed(saveData: SaveData): Promise<SaveLoadResult> {
    const saveId = `${saveData.world.id}_${saveData.timestamp}`;
    const storageKey = `${STORAGE_KEY_PREFIX}${saveId}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      return { success: true, data: saveData };
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some saves.');
      }
      throw error;
    }
  }

  @HandleError()
  private async saveCompressed(saveData: SaveData): Promise<SaveLoadResult> {
    const compressed = await this.compressData(saveData);
    const saveId = `${saveData.world.id}_${saveData.timestamp}`;
    const storageKey = `${STORAGE_KEY_PREFIX}${saveId}`;

    try {
      localStorage.setItem(storageKey, compressed);
      return { success: true, data: saveData };
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some saves.');
      }
      throw error;
    }
  }

  @Profile()
  private async compressData(data: SaveData): Promise<string> {
    const jsonStr = JSON.stringify(data);
    const encoder = new TextEncoder();
    const compressed = encoder.encode(jsonStr);
    return btoa(String.fromCharCode(...compressed));
  }

  @Profile()
  private async decompressData(compressed: string): Promise<SaveData> {
    const decoded = atob(compressed);
    const bytes = new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(bytes);
    return JSON.parse(jsonStr);
  }

  private validateSaveData(data: unknown): data is SaveData {
    return (
      data !== null &&
      typeof data === 'object' &&
      'version' in data &&
      'timestamp' in data &&
      'world' in data &&
      typeof (data as SaveData).version === 'string' &&
      typeof (data as SaveData).timestamp === 'number' &&
      (data as SaveData).world &&
      typeof (data as SaveData).world.id === 'string' &&
      typeof (data as SaveData).world.name === 'string'
    );
  }
} 