import { PhysicsState } from '../types';
import { DirectionController } from '../behaviors/updateDirection';
import { ImpulseController } from '../behaviors/applyImpulse';
import { GravityController } from '../behaviors/applyGravity';
import { StateChecker } from '../behaviors/checkState';
import { PhysicsCalcProps } from './types';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';

export class PhysicsEngine {
  private directionController = new DirectionController();
  private impulseController = new ImpulseController();
  private gravityController = new GravityController();
  private stateChecker = new StateChecker();

  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    physicsState.activeState.velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);
    this.stateChecker.checkAll(calcProp, physicsState);
    const { rigidBodyRef, innerGroupRef, matchSizes } = calcProp;
    const { modeType = 'character' } = physicsState;
    this.directionController.updateDirection(
      physicsState,
      'normal',
      calcProp,
      modeType === 'airplane' ? innerGroupRef : undefined,
      modeType === 'airplane' ? matchSizes : undefined,
    );
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    if (modeType === 'character' || modeType === 'airplane') {
      this.gravityController.applyGravity(rigidBodyRef, physicsState);
    }
    if (modeType === 'vehicle' || modeType === 'airplane') {
      this.applyDamping(rigidBodyRef, physicsState);
    }
    if (rigidBodyRef?.current) {
      if (modeType === 'character' && innerGroupRef?.current) {
        const {
          gameStates: { isJumping, isFalling, isNotMoving },
          activeState,
          characterConfig: { linearDamping = 0.2, airDamping = 0.1, stopDamping = 2 },
        } = physicsState;
        rigidBodyRef.current.setLinearDamping(
          isJumping || isFalling
            ? airDamping
            : isNotMoving
              ? linearDamping * stopDamping
              : linearDamping,
        );
        innerGroupRef.current.quaternion.setFromEuler(activeState.euler);
      }
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }
  private applyDamping(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, vehicleConfig, airplaneConfig } = physicsState;
    let damping = 0;
    if (modeType === 'vehicle') {
      damping = vehicleConfig?.linearDamping || 0.9;
    } else if (modeType === 'airplane') {
      damping = airplaneConfig?.linearDamping || 0.8;
    }
    if (damping > 0) {
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }
}
