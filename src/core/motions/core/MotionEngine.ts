import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';

export interface MotionState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  direction: THREE.Vector3;
  lastUpdate: number;
}

export interface MotionConfig {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  turnSpeed: number;
  jumpForce: number;
  gravity: number;
  linearDamping: number;
  angularDamping: number;
}

export interface MotionMetrics {
  currentSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  frameTime: number;
  physicsTime: number;
  lastPosition: THREE.Vector3;
  isAccelerating: boolean;
  groundContact: boolean;
}

export type MotionType = 'character' | 'vehicle' | 'airplane';

export class MotionEngine {
  private state: MotionState;
  private config: MotionConfig;
  private metrics: MotionMetrics;
  private type: MotionType;

  constructor(type: MotionType, config: Partial<MotionConfig> = {}) {
    this.type = type;
    
    this.state = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      isGrounded: false,
      isMoving: false,
      speed: 0,
      direction: new THREE.Vector3(),
      lastUpdate: 0
    };

    this.config = {
      maxSpeed: 10,
      acceleration: 15,
      deceleration: 10,
      turnSpeed: 8,
      jumpForce: 12,
      gravity: -30,
      linearDamping: 0.95,
      angularDamping: 0.85,
      ...config
    };

    this.metrics = {
      currentSpeed: 0,
      averageSpeed: 0,
      totalDistance: 0,
      frameTime: 0,
      physicsTime: 0,
      lastPosition: new THREE.Vector3(),
      isAccelerating: false,
      groundContact: false
    };
  }

  updatePosition(position: THREE.Vector3): void {
    this.metrics.lastPosition.copy(this.state.position);
    this.state.position.copy(position);
    this.calculateSpeed();
  }

  updateVelocity(velocity: THREE.Vector3): void {
    this.state.velocity.copy(velocity);
    this.state.speed = velocity.length();
    this.state.isMoving = this.state.speed > 0.1;
  }

  updateRotation(rotation: THREE.Euler): void {
    this.state.rotation.copy(rotation);
  }

  setGrounded(grounded: boolean): void {
    this.state.isGrounded = grounded;
    this.metrics.groundContact = grounded;
  }

  applyForce(force: THREE.Vector3, rigidBody: RapierRigidBody): void {
    const currentVel = rigidBody.linvel();
    const newVel = new THREE.Vector3(
      currentVel.x + force.x,
      currentVel.y + force.y,
      currentVel.z + force.z
    );
    
    rigidBody.setLinvel(newVel, true);
  }

  calculateMovement(input: {
    forward: boolean;
    backward: boolean;
    leftward: boolean;
    rightward: boolean;
    shift: boolean;
    space: boolean;
  }, deltaTime: number): THREE.Vector3 {
    const movement = new THREE.Vector3();
    const speedMultiplier = input.shift ? 2 : 1;
    const targetSpeed = this.config.maxSpeed * speedMultiplier;

    if (input.forward) movement.z -= 1;
    if (input.backward) movement.z += 1;
    if (input.leftward) movement.x -= 1;
    if (input.rightward) movement.x += 1;

    if (movement.length() > 0) {
      movement.normalize();
      movement.multiplyScalar(targetSpeed * deltaTime);
    }

    return movement;
  }

  calculateJump(): THREE.Vector3 {
    if (!this.state.isGrounded) return new THREE.Vector3();
    return new THREE.Vector3(0, this.config.jumpForce, 0);
  }

  update(deltaTime: number): void {
    this.state.lastUpdate = Date.now();
    this.metrics.frameTime = deltaTime;
    this.updateMetrics(deltaTime);
  }

  private calculateSpeed(): void {
    const distance = this.state.position.distanceTo(this.metrics.lastPosition);
    this.metrics.totalDistance += distance;
    this.metrics.currentSpeed = distance / (this.metrics.frameTime || 0.016);
  }

  private updateMetrics(deltaTime: number): void {
    this.metrics.isAccelerating = this.state.speed > this.metrics.currentSpeed;
    this.metrics.averageSpeed = this.metrics.totalDistance / (this.state.lastUpdate / 1000);
  }

  getState(): Readonly<MotionState> {
    return { ...this.state };
  }

  getMetrics(): Readonly<MotionMetrics> {
    return { ...this.metrics };
  }

  getConfig(): Readonly<MotionConfig> {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<MotionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    this.state.position.set(0, 0, 0);
    this.state.velocity.set(0, 0, 0);
    this.state.rotation.set(0, 0, 0);
    this.state.speed = 0;
    this.state.isMoving = false;
    this.state.isGrounded = false;
    this.metrics.totalDistance = 0;
    this.metrics.currentSpeed = 0;
    this.metrics.averageSpeed = 0;
  }

  dispose(): void {
    this.reset();
  }
}
