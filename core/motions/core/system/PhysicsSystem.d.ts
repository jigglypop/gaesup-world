import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { PhysicsConfigType } from '@/core/stores/slices/physics/types';
import { AbstractSystem, SystemContext, SystemUpdateArgs } from '@core/boilerplate';
import { GameStatesType } from '@core/world/components/Rideable/types';
import type { PhysicsCalcProps, PhysicsState } from '../../types';
import { ForceComponent } from '../forces/ForceComponent';
import { EntityStateManager } from './EntityStateManager';
import { PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions } from './types';
export interface PhysicsUpdateArgs extends SystemUpdateArgs {
    calcProp: PhysicsCalcProps;
    physicsState: PhysicsState;
}
export declare class PhysicsSystem extends AbstractSystem<PhysicsSystemState, PhysicsSystemMetrics, PhysicsSystemOptions, PhysicsUpdateArgs> {
    private directionComponent;
    private impulseComponent;
    private gravityComponent;
    private animationController;
    private forceComponents;
    private keyStateCache;
    private isCurrentlyJumping;
    private lastJumpPressed;
    private lastMovingState;
    private lastRunningState;
    private lastPositionY;
    private groundStableCount;
    private lastGroundedY;
    private tempQuaternion;
    private tempEuler;
    private tempVector;
    private jumpScratch;
    private config;
    constructor(config: PhysicsConfigType, options?: PhysicsSystemOptions, stateManager?: EntityStateManager);
    updateConfig(newConfig: Partial<PhysicsConfigType>): void;
    protected performUpdate(args: PhysicsUpdateArgs): void;
    protected createUpdateArgs(context: SystemContext): PhysicsUpdateArgs;
    protected updateMetrics(deltaTime: number): void;
    updateWithArgs(args: PhysicsUpdateArgs): void;
    calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void;
    private checkAllStates;
    private checkGround;
    private checkMoving;
    private checkRiding;
    private freezeInput;
    private resetJumpState;
    private calculateCharacter;
    private calculateVehicle;
    private calculateAirplane;
    private applyDamping;
    addForceComponent(component: ForceComponent): void;
    applyForce(force: THREE.Vector3, rigidBody: RapierRigidBody): void;
    calculateMovement(input: {
        forward: boolean;
        backward: boolean;
        leftward: boolean;
        rightward: boolean;
        shift: boolean;
        space: boolean;
        isLookAround?: boolean;
    }, config: PhysicsConfigType, gameStates: GameStatesType, deltaTime: number, out?: THREE.Vector3): THREE.Vector3;
    calculateJump(config: PhysicsConfigType, gameStates: GameStatesType, isGrounded: boolean): THREE.Vector3;
    private updateForces;
    /**
     * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
     */
    private copyVector3;
    protected onDispose(): void;
    /**
     * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
     */
    private updateStateIfChanged;
}
