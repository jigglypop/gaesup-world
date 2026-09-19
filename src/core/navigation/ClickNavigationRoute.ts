import * as THREE from 'three';

type ClickNavigationListener = () => void;

export function createClickNavigationRoute() {
  const routeState = {
    requestId: 0,
    waypoints: [] as THREE.Vector3[],
    threshold: 1,
    shouldRun: false,
    listeners: new Set<ClickNavigationListener>(),
  };

  function notify(): void {
    routeState.listeners.forEach((listener) => listener());
  }

  function nextClickNavigationRequest(): number {
    routeState.requestId += 1;
    return routeState.requestId;
  }

  function isLatestClickNavigationRequest(requestId: number): boolean {
    return routeState.requestId === requestId;
  }

  function setClickNavigationRoute(
    waypoints: THREE.Vector3[],
    threshold: number,
    shouldRun: boolean,
  ): void {
    routeState.waypoints = waypoints;
    routeState.threshold = threshold;
    routeState.shouldRun = shouldRun;
    notify();
  }

  function clearClickNavigationRoute(): void {
    if (routeState.waypoints.length === 0) return;
    routeState.waypoints = [];
    notify();
  }

  function subscribeClickNavigationRoute(listener: ClickNavigationListener): () => void {
    routeState.listeners.add(listener);
    return () => routeState.listeners.delete(listener);
  }

  function getClickNavigationRoute(): THREE.Vector3[] {
    return routeState.waypoints;
  }

  function getClickNavigationSettings(): { threshold: number; shouldRun: boolean } {
    return {
      threshold: routeState.threshold,
      shouldRun: routeState.shouldRun,
    };
  }

  function consumeReachedClickNavigationWaypoint(
    currentPosition: THREE.Vector3,
  ): THREE.Vector3 | null {
    const next = routeState.waypoints[0];
    if (!next) return null;
    if (currentPosition.distanceTo(next) > routeState.threshold) return next;

    routeState.waypoints.shift();
    notify();
    return routeState.waypoints[0] ?? null;
  }

  return {
    nextClickNavigationRequest,
    isLatestClickNavigationRequest,
    setClickNavigationRoute,
    clearClickNavigationRoute,
    subscribeClickNavigationRoute,
    getClickNavigationRoute,
    getClickNavigationSettings,
    consumeReachedClickNavigationWaypoint,
  };
}

export type ClickNavigationRoute = ReturnType<typeof createClickNavigationRoute>;
export const defaultClickNavigationRoute = createClickNavigationRoute();
export const {
  nextClickNavigationRequest,
  isLatestClickNavigationRequest,
  setClickNavigationRoute,
  clearClickNavigationRoute,
  subscribeClickNavigationRoute,
  getClickNavigationRoute,
  getClickNavigationSettings,
  consumeReachedClickNavigationWaypoint,
} = defaultClickNavigationRoute;
