import * as THREE from 'three';
type ClickNavigationListener = () => void;
export declare function nextClickNavigationRequest(): number;
export declare function isLatestClickNavigationRequest(requestId: number): boolean;
export declare function setClickNavigationRoute(waypoints: THREE.Vector3[], threshold: number, shouldRun: boolean): void;
export declare function setClickNavigationPreview(waypoints: THREE.Vector3[]): void;
export declare function clearClickNavigationRoute(): void;
export declare function subscribeClickNavigationRoute(listener: ClickNavigationListener): () => void;
export declare function getClickNavigationRoute(): THREE.Vector3[];
export declare function hasClickNavigationRoute(): boolean;
export declare function getClickNavigationSettings(): {
    threshold: number;
    shouldRun: boolean;
};
export declare function consumeReachedClickNavigationWaypoint(currentPosition: THREE.Vector3): THREE.Vector3 | null;
export {};
