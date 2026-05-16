import type { CameraSaveData, SaveData, SaveMetadata, WorldSaveData } from './types';
import type { SaveSystem, SerializedDomainValue } from '../../save';
export declare const DEFAULT_WORLD_SAVE_ENVIRONMENT: WorldSaveData['environment'];
export declare function createCameraSaveDataFromDomain(domain: Record<string, unknown> | undefined): CameraSaveData | undefined;
export declare function createWorldDataFromSaveDomains(domains: Record<string, SerializedDomainValue>, worldId: string, worldName: string): WorldSaveData;
export declare function parseWorldSaveTimestamp(saveId: string): number;
export declare function parseWorldSaveId(saveId: string): string;
export declare function normalizeSaveMetadata(metadata: Partial<SaveMetadata> | undefined, timestamp: number): SaveMetadata | undefined;
export declare function createSaveDataFromSaveSystem(saveSystem: SaveSystem, saveId: string, worldName?: string, metadata?: Partial<SaveMetadata>): SaveData;
