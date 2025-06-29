import { PhysicsState } from '../types';
import { PhysicsCalcProps } from '../core/types';
export declare class StateChecker {
    private keyStateCache;
    private isCurrentlyJumping;
    private lastMovingState;
    private lastRunningState;
    checkAll(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void;
    private checkGround;
    private checkMoving;
    private checkRotate;
    private checkRiding;
    private resetJumpState;
}
