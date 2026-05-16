import { BlueprintRecord } from '../types';
export type SpawnOptions = {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    metadata?: BlueprintRecord;
};
export type SpawnedEntity = {
    id: string;
    blueprintId: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    metadata?: BlueprintRecord;
};
export declare function useSpawnFromBlueprint(): {
    spawnEntity: (blueprintId: string, options?: SpawnOptions) => Promise<SpawnedEntity | null>;
    spawnAtCursor: (blueprintId: string) => Promise<SpawnedEntity | null>;
    spawnMultiple: (blueprintId: string, count: number, options?: SpawnOptions & {
        spacing?: number;
    }) => Promise<SpawnedEntity[]>;
    isSpawning: boolean;
    lastSpawnedEntity: SpawnedEntity | null;
};
