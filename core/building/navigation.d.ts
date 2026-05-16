import type { NavigationSystem } from '../navigation';
import type { BuildingBlockConfig, PlacedObject, TileGroupConfig, WallGroupConfig } from './types';
export type BuildingNavigationObstacleSource = {
    wallGroups?: Iterable<WallGroupConfig>;
    tileGroups?: Iterable<TileGroupConfig>;
    blocks?: Iterable<BuildingBlockConfig>;
    objects?: Iterable<PlacedObject>;
};
export type BuildingNavigationObstacleOptions = {
    includeTiles?: boolean;
    includeWalls?: boolean;
    includeBlocks?: boolean;
    includeObjects?: boolean;
    reset?: boolean;
    objectPadding?: number;
    wallPadding?: number;
};
export declare function applyBuildingNavigationObstacles(navigation: NavigationSystem, source: BuildingNavigationObstacleSource, options?: BuildingNavigationObstacleOptions): number;
