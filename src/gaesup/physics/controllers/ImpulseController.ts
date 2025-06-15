import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsState } from '../types';
import { eventBus } from '../connectors';

export class ImpulseController {
  applyImpulse(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
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

  private applyCharacterImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState,
  ): void {
    const {
      gameStates: { isMoving, isRunning, isOnTheGround, isJumping },
      activeState,
      characterConfig,
    } = physicsState;
    const { walkSpeed = 10, runSpeed = 20, jumpSpeed = 15 } = characterConfig;
    if (isJumping && isOnTheGround) {
      const currentVel = rigidBodyRef.current!.linvel();
      rigidBodyRef.current!.setLinvel({ x: currentVel.x, y: jumpSpeed, z: currentVel.z }, true);
      eventBus.emit('JUMP_STATE_CHANGE', {
        isJumping: false,
        isOnTheGround: true,
      });
    }
    if (isMoving) {
      const speed = isRunning ? runSpeed : walkSpeed;
      const dir = activeState.dir;
      const vel = activeState.velocity;
      const M = rigidBodyRef.current!.mass();
      const targetVelX = -dir.x * speed;
      const targetVelZ = -dir.z * speed;
      const accelX = targetVelX - vel.x;
      const accelZ = targetVelZ - vel.z;
      const forceX = accelX * M;
      const forceZ = accelZ * M;
      rigidBodyRef.current!.applyImpulse({ x: forceX, y: 0, z: forceZ }, true);
    }
  }

  private applyVehicleImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState,
  ): void {
    const { activeState, vehicleConfig } = physicsState;
    const { maxSpeed = 10 } = vehicleConfig;
    const impulse = activeState.direction.clone().multiplyScalar(maxSpeed);
    rigidBodyRef.current!.applyImpulse({ x: impulse.x, y: 0, z: impulse.z }, true);
  }

  private applyAirplaneImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState,
  ): void {
    const { activeState, airplaneConfig } = physicsState;
    const { maxSpeed = 5 } = airplaneConfig;
    const impulse = activeState.direction.clone().multiplyScalar(maxSpeed);
    rigidBodyRef.current!.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }
}
