import { PhysicsState } from '../types';
import { PhysicsCalcProps } from './types';
import { characterConfigType, vehicleConfigType, airplaneConfigType } from '../types';
export interface PhysicsConfig {
    character: characterConfigType;
    vehicle: vehicleConfigType;
    airplane: airplaneConfigType;
}
export declare class PhysicsEngine {
    private directionController;
    private impulseController;
    private gravityController;
    private stateChecker;
    private animationController;
    private tempQuaternion;
    private tempEuler;
    private config;
    private stateEngine;
    constructor(config?: Partial<PhysicsConfig>);
    updateConfig(newConfig: Partial<PhysicsConfig>): void;
    calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void;
    private calculateCharacter;
    private calculateVehicle;
    private calculateAirplane;
    private applyDamping;
}
