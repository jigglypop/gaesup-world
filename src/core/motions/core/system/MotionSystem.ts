import { AbstractSystem, SystemUpdateArgs, Autowired } from '@core/boilerplate';
import * as THREE from 'three';
import { vec3, quat, RapierRigidBody } from '@react-three/rapier';
import { MotionState, MotionMetrics, MotionSystemOptions, ActiveStateType, GameStatesType } from './types';
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

export class MotionSystem extends AbstractSystem<MotionState, MotionMetrics, MotionSystemOptions, MotionUpdateArgs> {
  @Autowired()
  private motionService!: MotionService;

  constructor(options: MotionSystemOptions) {
    super(defaultState, defaultMetrics, options);
  }

  protected performUpdate(args: MotionUpdateArgs): void {
    if (!args.rigidBody) return;
    const { position, velocity, rotation } = this.extractPhysicsState(args.rigidBody);
    this.updatePosition(position, args.activeState);
    this.updateVelocity(velocity, args.activeState, args.gameStates);
    this.updateRotation(rotation, args.activeState);
  }

  protected override updateMetrics(deltaTime: number): void {
    this.calculateSpeed(deltaTime);
    this.updateMultipleStates({
      isAccelerating: this.state.speed > this.metrics.currentSpeed
    } as Partial<MotionState>);
    this.metrics.averageSpeed = this.metrics.totalDistance / (this.state.lastUpdate / 1000 || 1);
  }

  private extractPhysicsState(rigidBody: RapierRigidBody) {
    const position = vec3(rigidBody.translation());
    const velocity = vec3(rigidBody.linvel());
    const rotation = new THREE.Euler().setFromQuaternion(quat(rigidBody.rotation()));
    return { position, velocity, rotation };
  }

  public updatePosition(position: THREE.Vector3, activeState: ActiveStateType): void {
    this.metrics.lastPosition.copy(this.state.position);
    this.state.position.copy(position);
    this.copyVector3(activeState.position, position);
  }

  public updateVelocity(velocity: THREE.Vector3, activeState: ActiveStateType, gameStates: GameStatesType): void {
    this.state.velocity.copy(velocity);
    this.state.speed = velocity.length();
    this.updateStateIfChanged('isMoving', this.state.speed > 0.1, () => {
      gameStates.isMoving = this.state.isMoving;
      gameStates.isNotMoving = !this.state.isMoving;
    });
    this.copyVector3(activeState.velocity, velocity);
  }

  public updateRotation(rotation: THREE.Euler, activeState: ActiveStateType): void {
    this.state.rotation.copy(rotation);
    activeState.euler.copy(rotation);
  }
  
  public setGrounded(grounded: boolean, activeState: ActiveStateType, gameStates: GameStatesType): void {
    this.state.isGrounded = grounded;
    this.metrics.groundContact = grounded;
    activeState.isGround = grounded;
    gameStates.isOnTheGround = grounded;
  }

  private calculateSpeed(deltaTime: number): void {
    const distance = this.state.position.distanceTo(this.metrics.lastPosition);
    this.metrics.totalDistance += distance;
    this.metrics.currentSpeed = this.motionService.calculateSpeed(this.state.velocity);
  }

  public calculateJump(config: { jumpSpeed: number }, gameStates: GameStatesType): THREE.Vector3 {
    return this.motionService.calculateJumpForce(this.state.isGrounded, config.jumpSpeed, gameStates);
  }

  public applyForce(movement: THREE.Vector3, rigidBody: RapierRigidBody): void {
    const config = this.motionService.getDefaultConfig();
    const force = this.motionService.calculateMovementForce(movement, this.state.velocity, config);
    rigidBody.applyImpulse(force, true);
  }

  protected onDispose(): void {
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
