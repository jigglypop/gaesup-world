import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import {
  PhysicsState,
  characterConfigType,
  vehicleConfigType,
  airplaneConfigType
} from '../types';
import { StateEngine } from '../core/StateEngine';
import { InteractionEngine } from '../../interactions/core/InteractionEngine';

type ImpulsePhysicsState = Pick<
  PhysicsState,
  'modeType' | 'gameStates' | 'activeState'
> & {
  characterConfig: characterConfigType;
  vehicleConfig: vehicleConfigType;
  airplaneConfig: airplaneConfigType;
};

export class ImpulseController {
  private readonly EPSILON = 0.01;
  private readonly EPSILON_VERTICAL = 0.1;
  private readonly BRAKE_THRESHOLD = 0.2;
  private stateEngine: StateEngine;
  private interactionEngine: InteractionEngine;

  constructor() {
    this.stateEngine = StateEngine.getInstance();
    this.interactionEngine = InteractionEngine.getInstance();
  }

  applyImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: ImpulsePhysicsState
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

  private applyCharacterImpulse(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: ImpulsePhysicsState
  ): void {
    const {
      gameStates: { isMoving, isRunning, isOnTheGround, isJumping },
      activeState,
      characterConfig,
    } = physicsState;
    const { walkSpeed = 10, runSpeed = 20, jumpSpeed = 15 } = characterConfig;
    if (isJumping && isOnTheGround) {
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: currentVel.x, y: jumpSpeed, z: currentVel.z }, true);
      this.stateEngine.updateGameStates({
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
    physicsState: ImpulsePhysicsState
  ): void {
    const { activeState, vehicleConfig } = physicsState;
    const keyboard = this.interactionEngine.getKeyboardRef();
    const { maxSpeed = 10, accelRatio = 2 } = vehicleConfig;
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
    physicsState: ImpulsePhysicsState
  ): void {
    const { activeState, airplaneConfig } = physicsState;
    const { maxSpeed = 20 } = airplaneConfig;
    
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
