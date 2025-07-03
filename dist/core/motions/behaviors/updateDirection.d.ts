import { RefObject } from 'react';
import * as THREE from 'three';
import { PhysicsCalcProps, PhysicsState, characterConfigType, airplaneConfigType } from '../types';
type DirectionPhysicsState = Pick<PhysicsState, 'modeType' | 'activeState' | 'keyboard' | 'mouse'> & {
    characterConfig: characterConfigType;
    airplaneConfig: airplaneConfigType;
};
export declare class DirectionController {
    private memoManager;
    private vectorCache;
    private tempEuler;
    private tempQuaternion;
    private targetQuaternion;
    private lastEulerY;
    private lastDirectionLength;
    private lastKeyboardState;
    private pendingStateUpdates;
    private timers;
    updateDirection(physicsState: DirectionPhysicsState, controlMode?: string, calcProp?: PhysicsCalcProps, innerGroupRef?: RefObject<THREE.Group>, matchSizes?: THREE.Vector3): void;
    private updateCharacterDirection;
    private updateVehicleDirection;
    private updateAirplaneDirection;
    private applyAirplaneRotation;
    private handleMouseDirection;
    private handleClicker;
    private applyMouseRotation;
    private handleKeyboardDirection;
    private emitRotationUpdate;
    dispose(): void;
}
export {};
