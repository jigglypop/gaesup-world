import * as THREE from 'three';

type ClickNavigationListener = () => void;

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

export function nextClickNavigationRequest(): number {
  routeState.requestId += 1;
  return routeState.requestId;
}

export function isLatestClickNavigationRequest(requestId: number): boolean {
  return routeState.requestId === requestId;
}

export function setClickNavigationRoute(
  waypoints: THREE.Vector3[],
  threshold: number,
  shouldRun: boolean,
): void {
  routeState.waypoints = waypoints;
  routeState.threshold = threshold;
  routeState.shouldRun = shouldRun;
  notify();
}

export function clearClickNavigationRoute(): void {
  if (routeState.waypoints.length === 0) return;
  routeState.waypoints = [];
  notify();
}

export function subscribeClickNavigationRoute(listener: ClickNavigationListener): () => void {
  routeState.listeners.add(listener);
  return () => routeState.listeners.delete(listener);
}

export function getClickNavigationRoute(): THREE.Vector3[] {
  return routeState.waypoints;
}

const clickNavigationSettings = { threshold: 0, shouldRun: false };

export function getClickNavigationSettings(): Readonly<{ threshold: number; shouldRun: boolean }> {
  clickNavigationSettings.threshold = routeState.threshold;
  clickNavigationSettings.shouldRun = routeState.shouldRun;
  return clickNavigationSettings;
}

export function consumeReachedClickNavigationWaypoint(currentPosition: THREE.Vector3): THREE.Vector3 | null {
  const next = routeState.waypoints[0];
  if (!next) return null;
  const dx = currentPosition.x - next.x;
  const dz = currentPosition.z - next.z;
  if (dx * dx + dz * dz > routeState.threshold * routeState.threshold) return next;

  routeState.waypoints.shift();
  notify();
  return routeState.waypoints[0] ?? null;
}
