import type { RapierRigidBody } from '@react-three/rapier';
export interface PlayerUpdateData {
    name: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number, number];
    animation: string;
    velocity: [number, number, number];
    modelUrl?: string | undefined;
}
export interface PlayerTrackingConfig {
    updateRate: number;
    velocityThreshold: number;
    sendRateLimit: number;
}
export declare class PlayerPositionTracker {
    private lastPosition;
    private lastRotation;
    private lastAnimation;
    private velocity;
    private lastUpdateTime;
    private config;
    private tempPos;
    private tempRot;
    private tempSendRot;
    private tempEuler;
    private baseYaw;
    private scratchUpdate;
    constructor(config: PlayerTrackingConfig);
    trackPosition(playerRef: {
        current: RapierRigidBody | null;
    }, playerName: string, playerColor: string, modelUrl?: string, animationName?: string | null): PlayerUpdateData | null;
    updateConfig(config: Partial<PlayerTrackingConfig>): void;
    reset(): void;
}
