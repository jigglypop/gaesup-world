import { Vector3, Euler } from 'three';
export interface TeleportResult {
    teleport: (position: Vector3, rotation?: Euler) => void;
    canTeleport: boolean;
}
export declare function useTeleport(): TeleportResult;
