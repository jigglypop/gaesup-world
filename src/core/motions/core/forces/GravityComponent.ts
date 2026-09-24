
import { RapierRigidBody } from '@react-three/rapier';

import { Profile } from '@/core/boilerplate/decorators';
import type { RefObject } from '@core/boilerplate';

import type { PhysicsState } from '../../types';
import type { PhysicsConfigType } from '../config';
import { applyGravityScale } from '../system/bodySettings';

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
      applyGravityScale(rigidBodyRef.current, jumpGravityScale);
    } else {
      applyGravityScale(rigidBodyRef.current, normalGravityScale);
    }
  }

  @Profile()
  private applyAirplaneGravity(
    rigidBodyRef: RefObject<RapierRigidBody>
  ): void {
    const { gravityScale = 0.3 } = this.config;
    applyGravityScale(rigidBodyRef.current, gravityScale);
  }

  @Profile()
  private applyVehicleGravity(
    rigidBodyRef: RefObject<RapierRigidBody>
  ): void {
    const { normalGravityScale = 1.0 } = this.config;
    applyGravityScale(rigidBodyRef.current, normalGravityScale);
  }
}
