import { PhysicsState } from '../types';
import { PhysicsCalcProps } from './types';
export declare class PhysicsEngine {
    private directionController;
    private impulseController;
    private gravityController;
    private stateChecker;
    calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void;
    private applyDamping;
}
