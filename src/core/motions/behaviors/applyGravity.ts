import { PhysicsState, characterConfigType, airplaneConfigType } from '../types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';

type GravityPhysicsState = Pick<
  PhysicsState,
  'modeType' | 'gameStates'
> & {
  characterConfig: characterConfigType;
  airplaneConfig: airplaneConfigType;
};

export class GravityController {
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
      characterConfig: { jumpGravityScale = 1.5, normalGravityScale = 1.0 },
    } = physicsState;
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
    const { airplaneConfig: { gravityScale = 0.3 } = {} } = physicsState;
    rigidBodyRef.current.setGravityScale(gravityScale, false);
  }
}
