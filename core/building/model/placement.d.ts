import { SquareGridAdapter } from '../../grid';
import type { CellCoord, EdgeCoord, EdgeSide, Vec3 } from '../../grid';
import type { GridAdapter } from '../../grid';
import type { PlacementEngine, PlacementEntry, PlacementRule } from '../../placement';
import type { BuildingBlockConfig, TileConfig, TileGroupConfig, WallConfig, WallGroupConfig } from '../types';
export type TileMeta = {
    x: number;
    z: number;
    y: number;
    halfSize: number;
};
export type WallMeta = {
    x: number;
    z: number;
    rotY: number;
};
export type BuildingPlacementCoord = {
    kind: 'cell';
    cell: CellCoord;
} | {
    kind: 'edge';
    edge: EdgeCoord;
};
export interface BuildingPlacementEngineOptions {
    includeNoOverlapRule?: boolean;
    rules?: Array<PlacementRule<BuildingPlacementCoord>>;
    blocks?: Iterable<BuildingBlockConfig>;
}
export declare const buildingGridAdapter: SquareGridAdapter;
export declare const zigZag: (n: number) => number;
export declare const pair: (a: number, b: number) => number;
export declare const snapBuildingPosition: <TPosition extends Vec3>(position: TPosition) => TPosition;
export declare const worldToBuildingCell: (position: Vec3) => CellCoord;
export declare const buildingCellToWorld: (coord: CellCoord) => Vec3;
export declare const normalizeQuarterTurnRotation: (rotation: number) => number;
export declare const edgeSideToWallRotation: (side: EdgeSide) => number;
export declare const edgeToWallTransform: (edge: EdgeCoord) => {
    position: Vec3;
    rotationY: number;
};
export declare const wallTransformToEdge: (position: Vec3, rotationY: number) => EdgeCoord;
export declare const edgeKey: (edge: EdgeCoord) => string;
export declare const tilePositionToCell: (position: Vec3) => CellCoord;
export declare const cellToTilePosition: (cell: CellCoord) => Vec3;
export declare const createTileFootprint: (cell: CellCoord, size?: number) => CellCoord[];
export declare const tileFootprintKeys: (footprint: CellCoord[]) => string[];
export declare const createBlockFootprint: (cell: CellCoord, size?: BuildingBlockConfig["size"]) => CellCoord[];
export declare const buildingPlacementAdapter: GridAdapter<BuildingPlacementCoord>;
export declare const tileToPlacementEntry: (tile: TileConfig) => PlacementEntry<BuildingPlacementCoord>;
export declare const wallToPlacementEntry: (wall: WallConfig) => PlacementEntry<BuildingPlacementCoord>;
export declare const blockToPlacementEntry: (block: BuildingBlockConfig) => PlacementEntry<BuildingPlacementCoord>;
export declare const tileGroupToPlacementEntries: (group: TileGroupConfig) => Array<PlacementEntry<BuildingPlacementCoord>>;
export declare const wallGroupToPlacementEntries: (group: WallGroupConfig) => Array<PlacementEntry<BuildingPlacementCoord>>;
export declare const buildingGroupsToPlacementEntries: (tileGroups: Iterable<TileGroupConfig>, wallGroups: Iterable<WallGroupConfig>, blocks?: Iterable<BuildingBlockConfig>) => Array<PlacementEntry<BuildingPlacementCoord>>;
export declare const createBuildingPlacementEngine: (tileGroups?: Iterable<TileGroupConfig>, wallGroups?: Iterable<WallGroupConfig>, options?: BuildingPlacementEngineOptions) => PlacementEngine<BuildingPlacementCoord>;
export declare const unindexId: (cells: Map<number, Set<string>>, cellsById: Map<string, number[]>, id: string) => void;
export declare const indexAabb: (cells: Map<number, Set<string>>, cellsById: Map<string, number[]>, id: string, minX: number, maxX: number, minZ: number, maxZ: number, cellSize: number) => void;
export declare const queryAabbIds: (cells: Map<number, Set<string>>, minX: number, maxX: number, minZ: number, maxZ: number, cellSize: number) => Set<string>;
export declare const tileHalfSize: (multiplier: number) => number;
export declare const tileOverlaps: (a: {
    x: number;
    z: number;
    halfSize: number;
}, b: {
    x: number;
    z: number;
    halfSize: number;
}) => boolean;
export declare const hasTileCollision: (tileIndex: Map<number, Set<string>>, tileMeta: Map<string, TileMeta>, position: Vec3, multiplier: number) => boolean;
export declare const getTileSupportHeight: (tileIndex: Map<number, Set<string>>, tileMeta: Map<string, TileMeta>, position: Vec3, multiplier: number) => number;
export declare const hasWallCollision: (wallIndex: Map<number, Set<string>>, wallMeta: Map<string, WallMeta>, position: Vec3, rotation: number) => boolean;
