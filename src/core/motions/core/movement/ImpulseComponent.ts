import { RefObject } from 'react';

import { RapierRigidBody } from '@react-three/rapier';

import { Profile } from '@/core/boilerplate/decorators';
import { InteractionSystem } from '@/core/interactions/core/InteractionSystem';
import { PhysicsConfigType } from '@stores/slices';

import { PhysicsState } from '../../types';
import { EntityStateManager } from '../system/EntityStateManager';


export class ImpulseComponent {
  private stateManager: EntityStateManager;
  private interactionSystem: InteractionSystem;
  private config: PhysicsConfigType;

  constructor(config: PhysicsConfigType) {
    this.stateManager = new EntityStateManager();
    this.interactionSystem = InteractionSystem.getInstance();
    this.config = config;
  }

  @Profile()
  applyImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
  ): void {
    if (!rigidBodyRef.current) return;
    const { modeType } = physicsState;
    switch (modeType) {
      case 'character':
        this.applyCharacterImpulse(rigidBodyRef, physicsState);
        break;
      case 'vehicle':
        this.applyVehicleImpulse(rigidBodyRef, physicsState);
        break;
      case 'airplane':
        this.applyAirplaneImpulse(rigidBodyRef, physicsState);
        break;
      default:
        this.applyCharacterImpulse(rigidBodyRef, physicsState);
    }
  }

  @Profile()
  private applyCharacterImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
  ): void {
    const {
      gameStates: { isMoving, isRunning, isOnTheGround, isJumping },
      activeState,
    } = physicsState;
    const { walkSpeed = 10, runSpeed = 20, jumpSpeed = 15 } = this.config;
    if (isJumping && isOnTheGround) {
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: currentVel.x, y: jumpSpeed, z: currentVel.z }, true);
      this.stateManager.updateGameStates({
        isOnTheGround: false,
      });
    }
    if (isMoving) {
      const speed = isRunning ? runSpeed : walkSpeed;
      const dir = activeState.dir;
      const vel = activeState.velocity;
      const M = rigidBodyRef.current.mass();
      const targetVelX = -dir.x * speed;
      const targetVelZ = -dir.z * speed;
      const accelX = targetVelX - vel.x;
      const accelZ = targetVelZ - vel.z;
      const forceX = accelX * M;
      const forceZ = accelZ * M;
      rigidBodyRef.current.applyImpulse({ x: forceX, y: 0, z: forceZ }, true);
    }
  }

  private applyVehicleImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
  ): void {
    const { activeState } = physicsState;
    const keyboard = this.interactionSystem.getKeyboardRef();
    const { maxSpeed = 10, accelRatio = 2 } = this.config;
    const { shift } = keyboard;
    const velocity = rigidBodyRef.current.linvel();
    const currentSpeed = Math.sqrt(
      velocity.x * velocity.x + velocity.z * velocity.z
    );
    if (currentSpeed < maxSpeed) {
      const M = rigidBodyRef.current.mass();
      const speed = shift ? accelRatio : 1;
      const impulse = {
        x: activeState.dir.x * M * speed,
        y: 0,
        z: activeState.dir.z * M * speed
      };
      rigidBodyRef.current.applyImpulse(impulse, true);
    }
  }

  private applyAirplaneImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
  ): void {
    const { activeState } = physicsState;
    const { maxSpeed = 20 } = this.config;
    
    const velocity = rigidBodyRef.current.linvel();
    const currentSpeed = Math.sqrt(
      velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z
    );
    if (currentSpeed < maxSpeed) {
      const M = rigidBodyRef.current.mass();
      const impulse = {
        x: activeState.direction.x * M,
        y: activeState.direction.y * M,
        z: activeState.direction.z * M
      };
      rigidBodyRef.current.applyImpulse(impulse, true);
    }
  }
}
