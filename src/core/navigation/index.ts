export {
  applyNPCNavigationRoute,
  createNPCNavigationRoute,
} from './NPCNavigationAdapter';
export type {
  ApplyNPCNavigationOptions,
  NavigationAgent,
  NPCNavigationRouteOptions,
  NPCNavigationSetter,
  NPCNavigationTarget,
} from './NPCNavigationAdapter';
export { NavigationSystem } from './NavigationSystem';
export { useNavigationSystem, useClickNavigationRoute, useNavigationObstacleRegistry } from './hooks/useNavigation';
export { createClickNavigationRoute } from './ClickNavigationRoute';
export type { ClickNavigationRoute } from './ClickNavigationRoute';
export type {
  NavigationAgentSize,
  NavigationConfig,
  NavigationQueryOptions,
  Waypoint,
} from './NavigationSystem';
export {
  applyRegisteredNavigationObstacles,
  getNavigationObstacles,
  registerNavigationObstacles,
  createNavigationObstacleRegistry,
} from './NavigationObstacleRegistry';
export type { NavigationObstacle, NavigationObstacleRegistry } from './NavigationObstacleRegistry';
