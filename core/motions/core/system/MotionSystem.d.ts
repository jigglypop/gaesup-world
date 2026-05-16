import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { AbstractSystem, SystemContext, SystemUpdateArgs } from '@core/boilerplate';
import type { GameStatesType } from '@core/world/components/Rideable/types';
import type { ActiveStateType } from '../types';
import { MotionState, MotionMetrics, MotionSystemOptions } from './types';
export interface MotionUpdateArgs extends SystemUpdateArgs {
    rigidBody: RapierRigidBody;
    activeState: ActiveStateType;
    gameStates: GameStatesType;
}
export declare class MotionSystem extends AbstractSystem<MotionState, MotionMetrics, MotionSystemOptions, MotionUpdateArgs> {
    private motionService;
    private temp;
    private tempQuaternion;
    private tempForce;
    constructor(options: MotionSystemOptions);
    protected performUpdate(args: MotionUpdateArgs): void;
    protected createUpdateArgs(context: SystemContext): MotionUpdateArgs;
    protected updateMetrics(deltaTime: number): void;
    private extractPhysicsState;
    updatePosition(position: THREE.Vector3, activeState: ActiveStateType): void;
    updateVelocity(velocity: THREE.Vector3, activeState: ActiveStateType, gameStates: GameStatesType): void;
    updateRotation(rotation: THREE.Euler, activeState: ActiveStateType): void;
    setGrounded(grounded: boolean, activeState: ActiveStateType, gameStates: GameStatesType): void;
    private calculateSpeed;
    calculateJump(config: {
        jumpSpeed: number;
    }, gameStates: GameStatesType): THREE.Vector3;
    applyForce(movement: THREE.Vector3, rigidBody: RapierRigidBody): void;
    protected onDispose(): void;
    /**
     * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
     */
    private copyVector3;
    /**
     * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
     */
    private updateStateIfChanged;
}
