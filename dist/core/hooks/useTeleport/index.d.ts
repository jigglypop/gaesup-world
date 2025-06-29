import * as THREE from 'three';
export interface TeleportResult {
    teleport: (position: THREE.Vector3) => boolean;
    canTeleport: boolean;
}
export declare function useTeleport(): TeleportResult;
