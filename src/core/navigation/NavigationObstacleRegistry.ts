import type { NavigationSystem } from './NavigationSystem';

export type NavigationObstacle = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
};

const obstacleSets = new Map<string, NavigationObstacle[]>();

export function registerNavigationObstacles(sourceId: string, obstacles: NavigationObstacle[]): () => void {
  obstacleSets.set(sourceId, obstacles);
  return () => {
    obstacleSets.delete(sourceId);
  };
}

export function getNavigationObstacles(): NavigationObstacle[] {
  return Array.from(obstacleSets.values()).flat();
}

export function applyRegisteredNavigationObstacles(navigation: NavigationSystem): number {
  let applied = 0;
  for (const obstacle of getNavigationObstacles()) {
    navigation.setBlocked(obstacle.x, obstacle.z, obstacle.width, obstacle.depth);
    applied += 1;
  }
  return applied;
}
