import type { NavigationSystem } from './NavigationSystem';

export type NavigationObstacle = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
};

export function createNavigationObstacleRegistry() {
const obstacleSets = new Map<string, { token: symbol; obstacles: NavigationObstacle[] }>();
const listeners = new Set<() => void>();
let revision = 0;
const publish = () => { revision++; for (const listener of listeners) listener(); };

function registerNavigationObstacles(sourceId: string, obstacles: NavigationObstacle[]): () => void {
  const token = Symbol(sourceId);
  obstacleSets.set(sourceId, { token, obstacles: obstacles.map(obstacle => ({ ...obstacle })) });
  publish();
  return () => {
    if (obstacleSets.get(sourceId)?.token !== token) return;
    obstacleSets.delete(sourceId);
    publish();
  };
}

function getNavigationObstacles(): NavigationObstacle[] {
  return Array.from(obstacleSets.values()).flatMap(entry => entry.obstacles.map(obstacle => ({ ...obstacle })));
}

function applyRegisteredNavigationObstacles(navigation: NavigationSystem): number {
  let applied = 0;
  for (const obstacle of getNavigationObstacles()) {
    navigation.setBlocked(obstacle.x, obstacle.z, obstacle.width, obstacle.depth);
    applied += 1;
  }
  return applied;
}

return {
  registerNavigationObstacles, getNavigationObstacles, applyRegisteredNavigationObstacles,
  getRevision: () => revision,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  clear: () => { if (obstacleSets.size) { obstacleSets.clear(); publish(); } },
};
}

export type NavigationObstacleRegistry = ReturnType<typeof createNavigationObstacleRegistry>;
export const defaultNavigationObstacleRegistry = createNavigationObstacleRegistry();
export const { registerNavigationObstacles, getNavigationObstacles, applyRegisteredNavigationObstacles } = defaultNavigationObstacleRegistry;
