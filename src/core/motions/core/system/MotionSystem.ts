import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { AbstractSystem, SystemUpdateArgs, Autowired } from '@core/boilerplate';
import { Profile, HandleError, ManageRuntime } from '@core/boilerplate';
import type { GameStatesType } from '@core/world/components/Rideable/types';

import type { ActiveStateType } from '../types';
import { MotionState, MotionMetrics, MotionSystemOptions } from './types';
import { MotionService } from '../services/MotionService';

const defaultState: MotionState = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  isGrounded: false,
  isMoving: false,
  speed: 0,
  direction: new THREE.Vector3(),
  lastUpdate: 0,
};

const defaultMetrics: MotionMetrics = {
  currentSpeed: 0,
  averageSpeed: 0,
  totalDistance: 0,
  frameTime: 0,
  physicsTime: 0,
  lastPosition: new THREE.Vector3(),
  isAccelerating: false,
  groundContact: false,
};

export interface MotionUpdateArgs extends SystemUpdateArgs {
  rigidBody: RapierRigidBody;
  activeState: ActiveStateType;
  gameStates: GameStatesType;
}

@ManageRuntime({ autoStart: false })
export class MotionSystem extends AbstractSystem<MotionState, MotionMetrics, MotionSystemOptions, MotionUpdateArgs> {
  @Autowired()
  private motionService!: MotionService;

  // Hot-path scratch objects to avoid per-frame allocations.
  private temp = {
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(),
  };
  private tempQuaternion = new THREE.Quaternion();
  private tempForce = new THREE.Vector3();

  constructor(options: MotionSystemOptions) {
    super(defaultState, defaultMetrics, options);
  }

  @Profile()
  protected performUpdate(args: MotionUpdateArgs): void {
    if (!args.rigidBody) return;
    const { position, velocity, rotation } = this.extractPhysicsState(args.rigidBody);
    this.updatePosition(position, args.activeState);
    this.updateVelocity(velocity, args.activeState, args.gameStates);
    this.updateRotation(rotation, args.activeState);
  }

  @Profile()
  protected override updateMetrics(deltaTime: number): void {
    void deltaTime;
    const previousSpeed = this.metrics.currentSpeed;
    this.calculateSpeed();
    this.state.isAccelerating = this.metrics.currentSpeed > previousSpeed;
    this.metrics.averageSpeed = this.metrics.totalDistance / (this.state.lastUpdate / 1000 || 1);
  }

  private extractPhysicsState(rigidBody: RapierRigidBody) {
    const translation = rigidBody.translation();
    this.temp.position.set(translation.x, translation.y, translation.z);

    const velocity = rigidBody.linvel();
    this.temp.velocity.set(velocity.x, velocity.y, velocity.z);

    const rotation = rigidBody.rotation();
    this.tempQuaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    this.temp.rotation.setFromQuaternion(this.tempQuaternion);

    return this.temp;
  }

  @HandleError()
  public updatePosition(position: THREE.Vector3, activeState: ActiveStateType): void {
    this.metrics.lastPosition.copy(this.state.position);
    this.state.position.copy(position);
    this.copyVector3(activeState.position, position);
  }

  @HandleError()
  public updateVelocity(velocity: THREE.Vector3, activeState: ActiveStateType, gameStates: GameStatesType): void {
    this.state.velocity.copy(velocity);
    this.state.speed = velocity.length();
    this.updateStateIfChanged('isMoving', this.state.speed > 0.1, () => {
      gameStates.isMoving = this.state.isMoving;
      gameStates.isNotMoving = !this.state.isMoving;
    });
    this.copyVector3(activeState.velocity, velocity);
  }

  @HandleError()
  public updateRotation(rotation: THREE.Euler, activeState: ActiveStateType): void {
    this.state.rotation.copy(rotation);
    activeState.euler.copy(rotation);
  }
  
  @HandleError()
  public setGrounded(grounded: boolean, activeState: ActiveStateType, gameStates: GameStatesType): void {
    this.state.isGrounded = grounded;
    this.metrics.groundContact = grounded;
    activeState.isGround = grounded;
    gameStates.isOnTheGround = grounded;
  }

  @Profile()
  private calculateSpeed(): void {
    const distance = this.state.position.distanceTo(this.metrics.lastPosition);
    this.metrics.totalDistance += distance;
    this.metrics.currentSpeed = this.motionService.calculateSpeed(this.state.velocity);
  }

  @HandleError()
  public calculateJump(config: { jumpSpeed: number }, gameStates: GameStatesType): THREE.Vector3 {
    return this.motionService.calculateJumpForce(this.state.isGrounded, config.jumpSpeed, gameStates);
  }

  @HandleError()
  public applyForce(movement: THREE.Vector3, rigidBody: RapierRigidBody): void {
    const config = this.motionService.getDefaultConfig();
    const force = this.motionService.calculateMovementForce(movement, this.state.velocity, config, this.tempForce);
    rigidBody.applyImpulse(force, true);
  }

  protected override onDispose(): void {
    this.metrics.lastPosition.set(0, 0, 0);
  }

  /**
   * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
   */
  private copyVector3<T extends { set: (x: number, y: number, z: number) => void }>(
    target: T, 
    source: { x: number; y: number; z: number }
  ): void {
    target.set(source.x, source.y, source.z);
  }

  /**
   * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
   */
  private updateStateIfChanged<K extends keyof MotionState>(
    key: K,
    newValue: MotionState[K],
    callback?: () => void
  ): boolean {
    if (this.state[key] !== newValue) {
      this.state[key] = newValue;
      callback?.();
      return true;
    }
    return false;
  }
}
