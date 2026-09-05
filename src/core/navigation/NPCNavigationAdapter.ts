import type { NavigationAgentSize, NavigationSystem, Waypoint } from './NavigationSystem';

export type NavigationAgent = NavigationAgentSize & {
  id: string;
  position: Waypoint;
};

export type NPCNavigationTarget = Waypoint;

export type NPCNavigationSetter = (
  instanceId: string,
  waypoints: Waypoint[],
  speed?: number,
) => void;

export type NPCNavigationRouteOptions = NavigationAgentSize & {
  weighted?: boolean;
  simplify?: boolean;
  includeStart?: boolean;
};

export type ApplyNPCNavigationOptions = NPCNavigationRouteOptions & {
  speed?: number;
  clearOnFail?: boolean;
  clearNavigation?: (instanceId: string) => void;
};

function resolveAgentSize(agent: NavigationAgent, options: NPCNavigationRouteOptions): NavigationAgentSize {
  const size: NavigationAgentSize = {};
  const agentRadius = options.agentRadius ?? agent.agentRadius;
  const agentWidth = options.agentWidth ?? agent.agentWidth;
  const agentDepth = options.agentDepth ?? agent.agentDepth;
  const clearance = options.clearance ?? agent.clearance;
  if (agentRadius !== undefined) size.agentRadius = agentRadius;
  if (agentWidth !== undefined) size.agentWidth = agentWidth;
  if (agentDepth !== undefined) size.agentDepth = agentDepth;
  if (clearance !== undefined) size.clearance = clearance;
  return size;
}

export function createNPCNavigationRoute(
  navigation: NavigationSystem,
  agent: NavigationAgent,
  target: NPCNavigationTarget,
  options: NPCNavigationRouteOptions = {},
): Waypoint[] {
  const agentSize = resolveAgentSize(agent, options);
  const path = navigation.findPath(
    agent.position[0],
    agent.position[2],
    target[0],
    target[2],
    {
      y: target[1],
      weighted: options.weighted ?? false,
      ...agentSize,
    },
  );
  if (path.length === 0) return [];

  const route = options.simplify === false ? path : navigation.smoothPath(path, undefined, undefined, agentSize);
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
