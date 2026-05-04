import { Profile, HandleError, MonitorMemory, Timeout } from '@/core/boilerplate/decorators';
import type { RuntimeValue } from '@/core/boilerplate/types';

import { 
  SaveData, 
  WorldSaveData, 
  SaveLoadOptions, 
  SaveLoadResult,
  SaveMetadata
} from './types';

const SAVE_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'gaesup_world_save_';
const BASE64_JSON_STORAGE_PREFIX = 'base64-json:';
const COMPRESSED_SAVE_ENCODING = 'gaesup-world:gzip-json:v1';

type CompressedSaveEnvelope = {
  encoding: typeof COMPRESSED_SAVE_ENCODING;
  version: string;
  timestamp: number;
  worldId: string;
  worldName: string;
  metadata?: SaveMetadata;
  payload: string;
};

export interface LegacySaveStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type SaveFileWriter = (filename: string, data: SaveData) => void | Promise<void>;

export interface SaveLoadManagerOptions {
  storage?: LegacySaveStorage;
  fileWriter?: SaveFileWriter;
  now?: () => number;
  version?: string;
}

export class SaveLoadManager {
  private version: string;
  private readonly storage: LegacySaveStorage | undefined;
  private readonly fileWriter: SaveFileWriter | undefined;
  private readonly now: () => number;

  constructor(options: SaveLoadManagerOptions = {}) {
    this.version = options.version ?? SAVE_VERSION;
    this.storage = options.storage;
    this.fileWriter = options.fileWriter;
    this.now = options.now ?? Date.now;
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
      const saveData = this.createSaveData(worldData, metadata, options);

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
      const savedDataStr = this.getStorage().getItem(storageKey);

      if (!savedDataStr) {
        throw new Error(`Save data not found: ${saveId}`);
      }

      const saveData = await this.parseStoredSaveData(savedDataStr);

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
      const saveData = this.createSaveData(worldData, metadata, options);

      await this.writeFile(filename, saveData);

      return { success: true, data: saveData };
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
    let storage: LegacySaveStorage;

    try {
      storage = this.getStorage();
    } catch (error) {
      console.error('Failed to list saves:', error);
      return saves;
    }

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const saveId = key.substring(STORAGE_KEY_PREFIX.length);
          const dataStr = storage.getItem(key);
          if (dataStr) {
            const data = this.parseStoredSaveDataSync(dataStr);
            saves.push({
              id: saveId,
              timestamp: data.timestamp,
              ...(data.metadata ? { metadata: data.metadata } : {}),
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
      this.getStorage().removeItem(storageKey);
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
        blocks: [],
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

  @Profile()
  private createSaveData(
    worldData: WorldSaveData,
    metadata?: Partial<SaveMetadata>,
    options: SaveLoadOptions = {},
  ): SaveData {
    const timestamp = this.now();
    return {
      version: this.version,
      timestamp,
      world: this.filterWorldData(worldData, options),
      ...(metadata
        ? {
            metadata: {
              ...metadata,
              createdAt: metadata.createdAt || timestamp,
              updatedAt: timestamp,
            },
          }
        : {}),
    };
  }

  private getStorage(): LegacySaveStorage {
    if (this.storage) return this.storage;
    if (typeof localStorage === 'undefined') {
      throw new Error('Legacy save storage is not available in this environment');
    }
    return localStorage;
  }

  private async writeFile(filename: string, data: SaveData): Promise<void> {
    if (this.fileWriter) {
      await this.fileWriter(filename, data);
      return;
    }

    if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
      throw new Error('File download is not available in this environment');
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  @HandleError()
  private async saveUncompressed(saveData: SaveData): Promise<SaveLoadResult> {
    const saveId = `${saveData.world.id}_${saveData.timestamp}`;
    const storageKey = `${STORAGE_KEY_PREFIX}${saveId}`;

    try {
      this.getStorage().setItem(storageKey, JSON.stringify(saveData));
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
      this.getStorage().setItem(storageKey, compressed);
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
    if (!canUseCompressionStream()) {
      return `${BASE64_JSON_STORAGE_PREFIX}${bytesToBase64(encodeUtf8(jsonStr))}`;
    }

    const compressed = await this.gzipBytes(encodeUtf8(jsonStr));
    const envelope: CompressedSaveEnvelope = {
      encoding: COMPRESSED_SAVE_ENCODING,
      version: data.version,
      timestamp: data.timestamp,
      worldId: data.world.id,
      worldName: data.world.name,
      ...(data.metadata ? { metadata: data.metadata } : {}),
      payload: bytesToBase64(compressed),
    };
    return JSON.stringify(envelope);
  }

  @Profile()
  private async decompressData(compressed: string): Promise<SaveData> {
    const bytes = base64ToBytes(compressed);
    const decompressed = await this.gunzipBytes(bytes);
    const jsonStr = decodeUtf8(decompressed);
    return JSON.parse(jsonStr);
  }

  private async parseStoredSaveData(value: string): Promise<SaveData> {
    if (value.startsWith('{')) {
      const parsed: unknown = JSON.parse(value);
      if (isCompressedSaveEnvelope(parsed)) {
        return this.decompressData(parsed.payload);
      }
      return parsed as SaveData;
    }
    if (value.startsWith(BASE64_JSON_STORAGE_PREFIX)) {
      return decodeBase64Json(value.slice(BASE64_JSON_STORAGE_PREFIX.length));
    }

    // Backward compatibility for older saves that stored raw base64 JSON bytes.
    return decodeBase64Json(value);
  }

  private parseStoredSaveDataSync(value: string): SaveData {
    if (value.startsWith('{')) {
      const parsed: unknown = JSON.parse(value);
      if (isCompressedSaveEnvelope(parsed)) {
        return {
          version: parsed.version,
          timestamp: parsed.timestamp,
          world: {
            id: parsed.worldId,
            name: parsed.worldName,
            buildings: { wallGroups: [], tileGroups: [], blocks: [], meshes: [] },
            npcs: [],
            environment: {
              lighting: {
                ambientIntensity: 1,
                directionalIntensity: 1,
                directionalPosition: { x: 0, y: 10, z: 0 },
              },
            },
          },
          ...(parsed.metadata ? { metadata: parsed.metadata } : {}),
        };
      }
      return parsed as SaveData;
    }
    if (value.startsWith(BASE64_JSON_STORAGE_PREFIX)) {
      return decodeBase64Json(value.slice(BASE64_JSON_STORAGE_PREFIX.length));
    }
    return decodeBase64Json(value);
  }

  private async gzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
    if (!canUseCompressionStream()) {
      return bytes;
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  private async gunzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
    if (!canUseDecompressionStream()) {
      return bytes;
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  private validateSaveData(data: RuntimeValue): data is SaveData {
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

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64Json(value: string): SaveData {
  return JSON.parse(decodeUtf8(base64ToBytes(value)));
}

function encodeUtf8(value: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  const escaped = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(escaped.length);
  for (let i = 0; i < escaped.length; i += 1) {
    bytes[i] = escaped.charCodeAt(i);
  }
  return bytes;
}

function decodeUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }

  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return decodeURIComponent(escape(binary));
}

function canUseCompressionStream(): boolean {
  return (
    typeof CompressionStream !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof Response !== 'undefined' &&
    typeof new Blob().stream === 'function'
  );
}

function canUseDecompressionStream(): boolean {
  return (
    typeof DecompressionStream !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof Response !== 'undefined' &&
    typeof new Blob().stream === 'function'
  );
}

function isCompressedSaveEnvelope(value: unknown): value is CompressedSaveEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CompressedSaveEnvelope>;
  return (
    candidate.encoding === COMPRESSED_SAVE_ENCODING &&
    typeof candidate.version === 'string' &&
    typeof candidate.timestamp === 'number' &&
    typeof candidate.worldId === 'string' &&
    typeof candidate.worldName === 'string' &&
    typeof candidate.payload === 'string'
  );
}
