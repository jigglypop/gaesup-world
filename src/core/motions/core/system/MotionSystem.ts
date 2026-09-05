import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { AbstractSystem, SystemContext, SystemUpdateArgs, Inject } from '@core/boilerplate';
import { Profile, HandleError, ManageRuntime } from '@core/boilerplate';
import type { RuntimeRecord } from '@core/boilerplate';
import type { GameStatesType } from '@core/world/components/Rideable/types';

import type { ActiveStateType } from '../types';
import { MotionState, MotionMetrics, MotionSystemOptions } from './types';
import { MotionService } from '../services/MotionService';

type Vector3Seed = {
  readonly isVector3: true;
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

type EulerSeed = {
  readonly isEuler: true;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly order: THREE.EulerOrder;
};

function isRuntimeObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVector3Seed(value: unknown): value is Vector3Seed {
  return (
    isRuntimeObject(value) &&
    value['isVector3'] === true &&
    typeof value['x'] === 'number' &&
    typeof value['y'] === 'number' &&
    typeof value['z'] === 'number'
  );
}

function isEulerOrder(value: unknown): value is THREE.EulerOrder {
  return (
    value === 'XYZ' ||
    value === 'YZX' ||
    value === 'ZXY' ||
    value === 'XZY' ||
    value === 'YXZ' ||
    value === 'ZYX'
  );
}

function isEulerSeed(value: unknown): value is EulerSeed {
  return (
    isRuntimeObject(value) &&
    value['isEuler'] === true &&
    typeof value['x'] === 'number' &&
    typeof value['y'] === 'number' &&
    typeof value['z'] === 'number' &&
    isEulerOrder(value['order'])
  );
}

function createOwnedVector3(value: unknown): THREE.Vector3 {
  return isVector3Seed(value)
    ? new THREE.Vector3(value.x, value.y, value.z)
    : new THREE.Vector3();
}

function createOwnedEuler(value: unknown): THREE.Euler {
  return isEulerSeed(value)
    ? new THREE.Euler(value.x, value.y, value.z, value.order)
    : new THREE.Euler();
}

function readSeedValue<ValueType>(
  seed: RuntimeRecord | undefined,
  key: string,
  defaultValue: ValueType,
): ValueType {
  return seed && key in seed ? seed[key] as ValueType : defaultValue;
}

function createMotionStateInitializer(overrides?: RuntimeRecord) {
  const seed = overrides ? { ...overrides } : undefined;
  const position = createOwnedVector3(seed?.['position']);
  const velocity = createOwnedVector3(seed?.['velocity']);
  const rotation = createOwnedEuler(seed?.['rotation']);
  const direction = createOwnedVector3(seed?.['direction']);
  const isGrounded = readSeedValue(seed, 'isGrounded', false);
  const isMoving = readSeedValue(seed, 'isMoving', false);
  const speed = readSeedValue(seed, 'speed', 0);

  return (): MotionState => ({
    ...seed,
    position: new THREE.Vector3(position.x, position.y, position.z),
    velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z),
    rotation: new THREE.Euler(rotation.x, rotation.y, rotation.z, rotation.order),
    isGrounded,
    isMoving,
    speed,
    direction: new THREE.Vector3(direction.x, direction.y, direction.z),
    lastUpdate: 0,
  });
}

function createMotionMetricsInitializer(overrides?: RuntimeRecord) {
  const seed = overrides ? { ...overrides } : undefined;
  const lastPosition = createOwnedVector3(seed?.['lastPosition']);
  const currentSpeed = readSeedValue(seed, 'currentSpeed', 0);
  const averageSpeed = readSeedValue(seed, 'averageSpeed', 0);
  const totalDistance = readSeedValue(seed, 'totalDistance', 0);
  const physicsTime = readSeedValue(seed, 'physicsTime', 0);
  const isAccelerating = readSeedValue(seed, 'isAccelerating', false);
  const groundContact = readSeedValue(seed, 'groundContact', false);

  return (): MotionMetrics => ({
    ...seed,
    currentSpeed,
    averageSpeed,
    totalDistance,
    frameTime: 0,
    physicsTime,
    lastPosition: new THREE.Vector3(lastPosition.x, lastPosition.y, lastPosition.z),
    isAccelerating,
    groundContact,
  });
}

export interface MotionUpdateArgs extends SystemUpdateArgs {
  rigidBody: RapierRigidBody;
  activeState: ActiveStateType;
  gameStates: GameStatesType;
}

function isMotionUpdateArgs(context: SystemContext | MotionUpdateArgs): context is MotionUpdateArgs {
  const candidate = context as Partial<MotionUpdateArgs>;
  return (
    candidate.rigidBody !== undefined &&
    candidate.activeState !== undefined &&
    candidate.gameStates !== undefined
  );
}

@ManageRuntime({ autoStart: false })
export class MotionSystem extends AbstractSystem<MotionState, MotionMetrics, MotionSystemOptions, MotionUpdateArgs> {
  @Inject(MotionService)
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
    super(
      createMotionStateInitializer(options.initialState),
      createMotionMetricsInitializer(options.initialMetrics),
      options,
    );
  }

  @Profile()
  protected performUpdate(args: MotionUpdateArgs): void {
    if (!args.rigidBody) return;
    const { position, velocity, rotation } = this.extractPhysicsState(args.rigidBody);
    this.updatePosition(position, args.activeState);
    this.updateVelocity(velocity, args.activeState, args.gameStates);
    this.updateRotation(rotation, args.activeState);
  }

  protected createUpdateArgs(context: SystemContext): MotionUpdateArgs {
    if (isMotionUpdateArgs(context)) {
      return context;
    }
    throw new Error('MotionSystem requires explicit motion update args.');
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
