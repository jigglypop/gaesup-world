import { MotionCommand, MotionSnapshot } from './MotionBridge';
import { MotionType } from '../core/MotionEngine';
export interface MotionBridgeInterface {
    registerEntity(id: string, type: MotionType, rigidBody: any): void;
    unregisterEntity(id: string): void;
    execute(entityId: string, command: MotionCommand): void;
    updateEntity(entityId: string, deltaTime: number): void;
    snapshot(entityId: string): MotionSnapshot | null;
    subscribe(listener: (snapshot: MotionSnapshot) => void): () => void;
    dispose(): void;
}
export interface MotionEvents {
    onMotionStart: (entityId: string, type: MotionType) => void;
    onMotionStop: (entityId: string) => void;
    onGroundContact: (entityId: string, isGrounded: boolean) => void;
    onSpeedChange: (entityId: string, speed: number) => void;
}
