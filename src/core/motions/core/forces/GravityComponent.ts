import { PhysicsState, characterConfigType, airplaneConfigType, vehicleConfigType } from '../types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsConfigType } from '@stores/slices';

type GravityPhysicsState = Pick<
  PhysicsState,
  'modeType' | 'gameStates'
> & {
  characterConfig: characterConfigType;
  airplaneConfig: airplaneConfigType;
  vehicleConfig: vehicleConfigType;
};

export class GravityComponent {
  private config: PhysicsConfigType;

  constructor(config: PhysicsConfigType) {
    this.config = config;
  }

  applyGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: GravityPhysicsState
  ): void {
    if (!rigidBodyRef.current) return;
    const { modeType } = physicsState;
    switch (modeType) {
      case 'character':
        this.applyCharacterGravity(rigidBodyRef, physicsState);
        break;
      case 'airplane':
        this.applyAirplaneGravity(rigidBodyRef, physicsState);
        break;
      case 'vehicle':
        this.applyVehicleGravity(rigidBodyRef, physicsState);
        break;
      default:
        this.applyCharacterGravity(rigidBodyRef, physicsState);
    }
  }

  private applyCharacterGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: GravityPhysicsState
  ): void {
    const {
      gameStates: { isJumping, isFalling },
    } = physicsState;
    const { jumpGravityScale = 1.5, normalGravityScale = 1.0 } = this.config;
    if (isJumping || isFalling) {
      rigidBodyRef.current.setGravityScale(jumpGravityScale, false);
    } else {
      rigidBodyRef.current.setGravityScale(normalGravityScale, false);
    }
  }

  private applyAirplaneGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: GravityPhysicsState
  ): void {
    const { gravityScale = 0.3 } = this.config;
    rigidBodyRef.current.setGravityScale(gravityScale, false);
  }

  private applyVehicleGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: GravityPhysicsState
  ): void {
    const { normalGravityScale = 1.0 } = this.config;
    rigidBodyRef.current.setGravityScale(normalGravityScale, false);
  }
}