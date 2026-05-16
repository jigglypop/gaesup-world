import type { NavigationSystem } from './NavigationSystem';
export type NavigationObstacle = {
    id: string;
    x: number;
    z: number;
    width: number;
    depth: number;
};
export declare function registerNavigationObstacles(sourceId: string, obstacles: NavigationObstacle[]): () => void;
export declare function getNavigationObstacles(): NavigationObstacle[];
export declare function applyRegisteredNavigationObstacles(navigation: NavigationSystem): number;
