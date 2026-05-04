import type { NavigationSystem, Waypoint } from './NavigationSystem';

export type NavigationAgent = {
  id: string;
  position: Waypoint;
};

export type NPCNavigationTarget = Waypoint;

export type NPCNavigationSetter = (
  instanceId: string,
  waypoints: Waypoint[],
  speed?: number,
) => void;

export type NPCNavigationRouteOptions = {
  weighted?: boolean;
  simplify?: boolean;
  includeStart?: boolean;
};

export type ApplyNPCNavigationOptions = NPCNavigationRouteOptions & {
  speed?: number;
  clearOnFail?: boolean;
  clearNavigation?: (instanceId: string) => void;
};

export function createNPCNavigationRoute(
  navigation: NavigationSystem,
  agent: NavigationAgent,
  target: NPCNavigationTarget,
  options: NPCNavigationRouteOptions = {},
): Waypoint[] {
  const path = navigation.findPath(
    agent.position[0],
    agent.position[2],
    target[0],
    target[2],
    target[1],
    options.weighted ?? false,
  );
  if (path.length === 0) return [];

  const route = options.simplify === false ? path : navigation.simplifyPath(path);
  return options.includeStart ? route : route.slice(1);
}

export function applyNPCNavigationRoute(
  navigation: NavigationSystem,
  agent: NavigationAgent,
  target: NPCNavigationTarget,
  setNavigation: NPCNavigationSetter,
  options: ApplyNPCNavigationOptions = {},
): Waypoint[] {
  const route = createNPCNavigationRoute(navigation, agent, target, options);
  if (route.length === 0) {
    if (options.clearOnFail) {
      options.clearNavigation?.(agent.id);
    }
    return [];
  }

  setNavigation(agent.id, route, options.speed);
  return route;
}
