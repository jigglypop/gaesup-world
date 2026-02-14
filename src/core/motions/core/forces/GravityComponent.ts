
import { RapierRigidBody } from '@react-three/rapier';

import { Profile } from '@/core/boilerplate/decorators';
import type { RefObject } from '@core/boilerplate';
import { PhysicsConfigType } from '@stores/slices';

import type { PhysicsState } from '../../types';

export class GravityComponent {
  private config: PhysicsConfigType;

  constructor(config: PhysicsConfigType) {
    this.config = config;
  }

  @Profile()
  applyGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
  ): void {
    if (!rigidBodyRef.current) return;
    const { modeType } = physicsState;
    switch (modeType) {
      case 'character':
        this.applyCharacterGravity(rigidBodyRef, physicsState);
        break;
      case 'airplane':
        this.applyAirplaneGravity(rigidBodyRef);
        break;
      case 'vehicle':
        this.applyVehicleGravity(rigidBodyRef);
        break;
      default:
        this.applyCharacterGravity(rigidBodyRef, physicsState);
    }
  }

  @Profile()
  private applyCharacterGravity(
    rigidBodyRef: RefObject<RapierRigidBody>,
    physicsState: PhysicsState
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

  @Profile()
  private applyAirplaneGravity(
    rigidBodyRef: RefObject<RapierRigidBody>
  ): void {
    const { gravityScale = 0.3 } = this.config;
    rigidBodyRef.current.setGravityScale(gravityScale, false);
  }

  @Profile()
  private applyVehicleGravity(
    rigidBodyRef: RefObject<RapierRigidBody>
  ): void {
    const { normalGravityScale = 1.0 } = this.config;
    rigidBodyRef.current.setGravityScale(normalGravityScale, false);
  }
}