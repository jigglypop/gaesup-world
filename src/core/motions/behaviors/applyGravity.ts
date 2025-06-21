import { RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { PhysicsState } from '../types';

export class GravityController {
  applyGravity(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
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
    physicsState: PhysicsState,
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
    physicsState: PhysicsState,
  ): void {
    const { airplaneConfig: { gravityScale = 0.3 } = {} } = physicsState;
    rigidBodyRef.current.setGravityScale(gravityScale, false);
  }
}
