import * as THREE from 'three';

import { Profile } from '@/core/boilerplate/decorators';
import { GameStatesType } from '@/core/world/components/Rideable/types';
import { Service } from '@core/boilerplate';

@Service()
export class MotionService {
  private readonly DEFAULT_JUMP_FORCE = 12;
  private readonly DEFAULT_MAX_SPEED = 10;
  private readonly DEFAULT_ACCELERATION = 5;
  private readonly GROUND_THRESHOLD = 0.1;

  @Profile()
  public calculateMovementForce(
    movement: THREE.Vector3,
    currentVelocity: THREE.Vector3,
    config: { maxSpeed: number; acceleration: number },
    out?: THREE.Vector3
  ): THREE.Vector3 {
    const { maxSpeed, acceleration } = config;
    const force = out ?? new THREE.Vector3();

    // Keep the input immutable (do not normalize/mutate `movement`).
    const lenSq = movement.x * movement.x + movement.y * movement.y + movement.z * movement.z;
    if (lenSq > 0) {
      const invLen = 1 / Math.sqrt(lenSq);
      const s = invLen * maxSpeed;
      force.set(movement.x * s, movement.y * s, movement.z * s);
    } else {
      force.set(0, 0, 0);
    }

    // velocityDiff = targetVelocity - currentVelocity
    force.sub(currentVelocity);
    force.multiplyScalar(acceleration);
    return force;
  }

  @Profile()
  public calculateJumpForce(
    isGrounded: boolean,
    jumpSpeed: number = this.DEFAULT_JUMP_FORCE,
    gameStates?: GameStatesType,
    out?: THREE.Vector3
  ): THREE.Vector3 {
    const jump = out ?? new THREE.Vector3(0, 0, 0);
    if (!isGrounded) return jump.set(0, 0, 0);
    const jumpMultiplier = gameStates?.isJumping ? 1.5 : 1;
    return jump.set(0, jumpSpeed * jumpMultiplier, 0);
  }

  public calculateGroundState(position: THREE.Vector3, velocity: THREE.Vector3): boolean {
    return Math.abs(velocity.y) < this.GROUND_THRESHOLD && position.y < this.GROUND_THRESHOLD;
  }

  public calculateSpeed(velocity: THREE.Vector3): number {
    // Hot path: avoid allocations.
    return Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  }

  public calculateDirection(from: THREE.Vector3, to: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    const dir = out ?? new THREE.Vector3();
    return dir.subVectors(to, from).normalize();
  }

  public applyDamping(velocity: THREE.Vector3, damping: number = 0.95, out?: THREE.Vector3): THREE.Vector3 {
    const v = out ?? new THREE.Vector3();
    return v.copy(velocity).multiplyScalar(damping);
  }

  @Profile()
  public limitVelocity(velocity: THREE.Vector3, maxSpeed: number): THREE.Vector3 {
    const speed = this.calculateSpeed(velocity);
    if (speed > maxSpeed) {
      const factor = maxSpeed / speed;
      velocity.x *= factor;
      velocity.z *= factor;
    }
    return velocity;
  }

  @Profile()
  public calculateRotationToTarget(
    currentPosition: THREE.Vector3,
    targetPosition: THREE.Vector3
  ): number {
    // Equivalent to atan2(normalized.x, normalized.z) without allocating a direction vector.
    const dx = targetPosition.x - currentPosition.x;
    const dz = targetPosition.z - currentPosition.z;
    return Math.atan2(dx, dz);
  }

  @Profile()
  public smoothRotation(
    currentRotation: number,
    targetRotation: number,
    smoothing: number = 0.1
  ): number {
    let diff = targetRotation - currentRotation;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return currentRotation + diff * smoothing;
  }

  @Profile()
  public calculateMetrics(
    velocity: THREE.Vector3,
    previousVelocity: THREE.Vector3,
    deltaTime: number,
    totalDistance: number
  ): {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    isAccelerating: boolean;
  } {
    const currentSpeed = this.calculateSpeed(velocity);
    const previousSpeed = this.calculateSpeed(previousVelocity);
    const distanceTraveled = currentSpeed * deltaTime;
    const newTotalDistance = totalDistance + distanceTraveled;
    
    return {
      currentSpeed,
      averageSpeed: newTotalDistance / (deltaTime * 1000),
      totalDistance: newTotalDistance,
      frameTime: deltaTime,
      isAccelerating: currentSpeed > previousSpeed
    };
  }

  public getDefaultConfig() {
    return {
      maxSpeed: this.DEFAULT_MAX_SPEED,
      acceleration: this.DEFAULT_ACCELERATION,
      jumpForce: this.DEFAULT_JUMP_FORCE
    };
  }
} 