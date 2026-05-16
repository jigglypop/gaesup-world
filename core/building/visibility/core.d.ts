import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from '../types';
export declare const VISIBILITY_CELL_SIZE = 18;
export declare const VISIBILITY_MAX_DISTANCE = 140;
export declare const VISIBILITY_UPDATE_INTERVAL = 0.12;
export declare const VISIBILITY_DIRECTION_BUCKETS = 8;
export declare const OCCLUDER_MIN_RADIUS = 3.2;
export declare const OCCLUDER_MIN_WALL_RADIUS = 2.4;
export declare const OCCLUSION_ALIGNMENT = 0.985;
export type VisibilityRecord = {
    id: string;
    centerX: number;
    centerY: number;
    centerZ: number;
    radius: number;
    cellX: number;
    cellZ: number;
};
export type OccluderRecord = VisibilityRecord & {
    key: string;
    kind: 'tile' | 'wall' | 'block';
    strength: number;
};
export type VisibilityIndex = {
    tileById: Map<string, VisibilityRecord>;
    wallById: Map<string, VisibilityRecord>;
    blockById: Map<string, VisibilityRecord>;
    objectById: Map<string, VisibilityRecord>;
    tileBuckets: Map<string, string[]>;
    wallBuckets: Map<string, string[]>;
    blockBuckets: Map<string, string[]>;
    objectBuckets: Map<string, string[]>;
    occluderByKey: Map<string, OccluderRecord>;
    occluderBuckets: Map<string, string[]>;
};
export declare function createVisibilityQueryKey(cameraX: number, cameraZ: number, forwardX: number, forwardZ: number, cellSize?: number, directionBuckets?: number): string;
export declare function buildTileGroupRecord(group: TileGroupConfig, cellSize?: number): VisibilityRecord | null;
export declare function buildWallGroupRecord(group: WallGroupConfig, cellSize?: number): VisibilityRecord | null;
export declare function buildBlockRecord(block: BuildingBlockConfig, cellSize?: number): VisibilityRecord;
export declare function buildObjectRecord(object: PlacedObject, cellSize?: number): VisibilityRecord;
export declare function buildVisibilityIndex(wallGroups: WallGroupConfig[], tileGroups: TileGroupConfig[], objects: PlacedObject[], blocksOrCellSize?: BuildingBlockConfig[] | number, maybeCellSize?: number): VisibilityIndex;
export declare function collectCandidateIds(buckets: Map<string, string[]>, cameraX: number, cameraZ: number, maxDistance?: number, cellSize?: number): Set<string>;
export declare function collectOccluderCandidates(index: VisibilityIndex, cameraX: number, cameraZ: number, maxDistance?: number, cellSize?: number): OccluderRecord[];
type VectorLike = {
    x: number;
    y: number;
    z: number;
};
type OcclusionScratch = {
    targetDir: import('three').Vector3;
    occDir: import('three').Vector3;
    cross: import('three').Vector3;
};
export declare function isOccludedByAny(record: VisibilityRecord, selfKind: 'tile' | 'wall' | 'block' | 'object', camera: VectorLike, occluders: OccluderRecord[], scratch: OcclusionScratch): boolean;
export {};
