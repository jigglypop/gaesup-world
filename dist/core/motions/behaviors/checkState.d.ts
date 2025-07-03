import { PhysicsState } from '../types';
import { PhysicsCalcProps } from '../core/types';
type CheckAllPhysicsState = Pick<PhysicsState, 'activeState'>;
export declare class StateChecker {
    private keyStateCache;
    private isCurrentlyJumping;
    private lastMovingState;
    private lastRunningState;
    checkAll(calcProp: PhysicsCalcProps, physicsState: CheckAllPhysicsState): void;
    private checkGround;
    private checkMoving;
    private checkRotate;
    private checkRiding;
    private resetJumpState;
}
export {};
