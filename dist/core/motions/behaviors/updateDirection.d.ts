import { RefObject } from 'react';
import * as THREE from 'three';
import { PhysicsCalcProps, PhysicsState } from '../types';
export declare class DirectionController {
    private memoManager;
    private vectorCache;
    private tempEuler;
    private tempQuaternion;
    private targetQuaternion;
    private lastEulerY;
    private lastDirectionLength;
    private lastKeyboardState;
    updateDirection(physicsState: PhysicsState, controlMode?: string, calcProp?: PhysicsCalcProps, innerGroupRef?: RefObject<THREE.Group>, matchSizes?: unknown): void;
    private updateCharacterDirection;
    private updateVehicleDirection;
    private updateAirplaneDirection;
    private applyAirplaneRotation;
    private handleMouseDirection;
    private handleClicker;
    private applyMouseRotation;
    private handleKeyboardDirection;
    private emitRotationUpdate;
}
