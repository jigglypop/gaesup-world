import type { NavigationAgentSize, NavigationSystem, Waypoint } from './NavigationSystem';
export type NavigationAgent = NavigationAgentSize & {
    id: string;
    position: Waypoint;
};
export type NPCNavigationTarget = Waypoint;
export type NPCNavigationSetter = (instanceId: string, waypoints: Waypoint[], speed?: number) => void;
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
export declare function createNPCNavigationRoute(navigation: NavigationSystem, agent: NavigationAgent, target: NPCNavigationTarget, options?: NPCNavigationRouteOptions): Waypoint[];
export declare function applyNPCNavigationRoute(navigation: NavigationSystem, agent: NavigationAgent, target: NPCNavigationTarget, setNavigation: NPCNavigationSetter, options?: ApplyNPCNavigationOptions): Waypoint[];
