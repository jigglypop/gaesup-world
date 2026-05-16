import { SaveData, WorldSaveData, SaveLoadOptions, SaveLoadResult, SaveMetadata } from './types';
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
export declare class SaveLoadManager {
    private version;
    private readonly storage;
    private readonly fileWriter;
    private readonly now;
    constructor(options?: SaveLoadManagerOptions);
    save(worldData: WorldSaveData, metadata?: Partial<SaveMetadata>, options?: SaveLoadOptions): Promise<SaveLoadResult>;
    load(saveId: string, options?: SaveLoadOptions): Promise<SaveLoadResult>;
    saveToFile(worldData: WorldSaveData, filename: string, metadata?: Partial<SaveMetadata>, options?: SaveLoadOptions): Promise<SaveLoadResult>;
    loadFromFile(file: File, options?: SaveLoadOptions): Promise<SaveLoadResult>;
    listSaves(): Array<{
        id: string;
        timestamp: number;
        metadata?: SaveMetadata;
    }>;
    deleteSave(saveId: string): boolean;
    private filterWorldData;
    private createSaveData;
    private getStorage;
    private writeFile;
    private saveUncompressed;
    private saveCompressed;
    private compressData;
    private decompressData;
    private parseStoredSaveData;
    private parseStoredSaveDataSync;
    private gzipBytes;
    private gunzipBytes;
    private validateSaveData;
}
