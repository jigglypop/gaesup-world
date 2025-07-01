import { PhysicsState } from '../types';
import { DirectionController } from '../behaviors/updateDirection';
import { ImpulseController } from '../behaviors/applyImpulse';
import { GravityController } from '../behaviors/applyGravity';
import { StateChecker } from '../behaviors/checkState';
import { PhysicsCalcProps } from './types';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';

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
      if (modeType === 'vehicle') {
        rigidBodyRef.current.setEnabledRotations(false, true, false, false);
        const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, physicsState.activeState.euler.y, 0));
        rigidBodyRef.current.setRotation(quat, true);
        if (innerGroupRef?.current) {
          innerGroupRef.current.rotation.y = 0; 
        }
      } else {
        rigidBodyRef.current.setEnabledRotations(false, false, false, false);
      }
    }
  }
  private applyDamping(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, vehicleConfig, airplaneConfig, keyboard } = physicsState;
    const { space } = keyboard;
    
    if (modeType === 'vehicle') {
      const { linearDamping = 0.9, brakeRatio = 5 } = vehicleConfig || {};
      const damping = space ? brakeRatio : linearDamping;
      rigidBodyRef.current.setLinearDamping(damping);
    } else if (modeType === 'airplane') {
      const damping = airplaneConfig?.linearDamping || 0.8;
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }
}
