import type { NavigationSystem } from '../../../navigation';
import { type BuildingNavigationObstacleOptions } from '../../navigation';
export type BuildingNavigationObstacleDriverProps = BuildingNavigationObstacleOptions & {
    navigation: NavigationSystem;
    enabled?: boolean;
};
export declare function BuildingNavigationObstacleDriver({ navigation, enabled, includeWalls, includeTiles, includeBlocks, includeObjects, reset, objectPadding, wallPadding, }: BuildingNavigationObstacleDriverProps): null;
export default BuildingNavigationObstacleDriver;
