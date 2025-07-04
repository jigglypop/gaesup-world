import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { ActiveStateType } from '../types';
import { GameStatesType } from '@core/world/components/Rideable/types';
import { PhysicsConfigType } from '@/core/stores/slices/mode copy/types';
import { MotionMetrics, MotionState, MotionType } from './types';
import { ForceComponent } from '../forces/ForceComponent';

export class MotionEngine {
  private state: MotionState;
  private metrics: MotionMetrics;
  private type: MotionType;
  private forceComponents: ForceComponent[] = [];

  constructor(type: MotionType) {
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

  addForceComponent(component: ForceComponent): void {
    this.forceComponents.push(component);
  }

  updateForces(rigidBody: RapierRigidBody, delta: number): void {
    for (const component of this.forceComponents) {
      component.update(rigidBody, delta);
    }
  }

  updatePosition(
    position: THREE.Vector3, 
    activeState: ActiveStateType
  ): void {
    this.metrics.lastPosition.copy(this.state.position);
    this.state.position.copy(position);
    this.calculateSpeed();
    activeState.position.copy(position);
  }

  updateVelocity(
    velocity: THREE.Vector3,
    activeState: ActiveStateType,
    gameStates: GameStatesType
  ): void {
    this.state.velocity.copy(velocity);
    this.state.speed = velocity.length();
    this.state.isMoving = this.state.speed > 0.1;
    activeState.velocity.copy(velocity);
    gameStates.isMoving = this.state.isMoving;
    gameStates.isNotMoving = !this.state.isMoving;
  }

  updateRotation(rotation: THREE.Euler, activeState: ActiveStateType): void {
    this.state.rotation.copy(rotation);
    activeState.euler.copy(rotation);
  }

  setGrounded(
    grounded: boolean,
    activeState: ActiveStateType,
    gameStates: GameStatesType
  ): void {
    this.state.isGrounded = grounded;
    this.metrics.groundContact = grounded;
    activeState.isGround = grounded;
    gameStates.isOnTheGround = grounded;
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

  calculateMovement(
    input: {
      forward: boolean;
      backward: boolean;
      leftward: boolean;
      rightward: boolean;
      shift: boolean;
      space: boolean;
    },
    config: PhysicsConfigType,
    gameStates: GameStatesType,
    deltaTime: number
  ): THREE.Vector3 {
    const movement = new THREE.Vector3();
    const speedMultiplier = input.shift ? 2 : 1;
    const targetSpeed = (config.maxSpeed ?? 10) * speedMultiplier;
    if (input.forward) movement.z -= 1;
    if (input.backward) movement.z += 1;
    if (input.leftward) movement.x -= 1;
    if (input.rightward) movement.x += 1;
    if (movement.length() > 0) {
      movement.normalize();
      movement.multiplyScalar(targetSpeed * deltaTime);
      gameStates.isRunning = input.shift;
      gameStates.isNotRunning = !input.shift;
    }
    return movement;
  }

  calculateJump(
    config: PhysicsConfigType,
    gameStates: GameStatesType,
  ): THREE.Vector3 {
    if (!this.state.isGrounded) return new THREE.Vector3();
    gameStates.isJumping = true;
    return new THREE.Vector3(0, config.jumpSpeed, 0);
  }

  update(rigidBody: RapierRigidBody, deltaTime: number): void {
    this.updateForces(rigidBody, deltaTime);
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
