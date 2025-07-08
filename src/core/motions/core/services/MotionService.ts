import { Service } from '@core/boilerplate';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { GameStatesType } from '@/core/world/components/Rideable/types';
import { Profile } from '@/core/boilerplate/decorators';

@Service()
export class MotionService {
  private readonly GRAVITY = -9.81;
  private readonly DEFAULT_JUMP_FORCE = 12;
  private readonly DEFAULT_MAX_SPEED = 10;
  private readonly DEFAULT_ACCELERATION = 5;
  private readonly GROUND_THRESHOLD = 0.1;

  @Profile()
  public calculateMovementForce(
    movement: THREE.Vector3,
    currentVelocity: THREE.Vector3,
    config: { maxSpeed: number; acceleration: number }
  ): THREE.Vector3 {
    const { maxSpeed, acceleration } = config;
    const targetVelocity = movement.clone().normalize().multiplyScalar(maxSpeed);
    const velocityDiff = targetVelocity.sub(currentVelocity);
    return velocityDiff.multiplyScalar(acceleration);
  }

  @Profile()
  public calculateJumpForce(
    isGrounded: boolean,
    jumpSpeed: number = this.DEFAULT_JUMP_FORCE,
    gameStates?: GameStatesType
  ): THREE.Vector3 {
    if (!isGrounded) return new THREE.Vector3(0, 0, 0);
    const jumpMultiplier = gameStates?.isJumping ? 1.5 : 1;
    return new THREE.Vector3(0, jumpSpeed * jumpMultiplier, 0);
  }

  public calculateGroundState(position: THREE.Vector3, velocity: THREE.Vector3): boolean {
    return Math.abs(velocity.y) < this.GROUND_THRESHOLD && position.y < this.GROUND_THRESHOLD;
  }

  public calculateSpeed(velocity: THREE.Vector3): number {
    const horizontalVelocity = new THREE.Vector3(velocity.x, 0, velocity.z);
    return horizontalVelocity.length();
  }

  public calculateDirection(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3 {
    return new THREE.Vector3().subVectors(to, from).normalize();
  }

  public applyDamping(velocity: THREE.Vector3, damping: number = 0.95): THREE.Vector3 {
    return velocity.clone().multiplyScalar(damping);
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
    const direction = this.calculateDirection(currentPosition, targetPosition);
    return Math.atan2(direction.x, direction.z);
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