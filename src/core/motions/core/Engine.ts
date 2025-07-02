import { PhysicsState } from '../types';
import { DirectionController } from '../behaviors/updateDirection';
import { ImpulseController } from '../behaviors/applyImpulse';
import { GravityController } from '../behaviors/applyGravity';
import { StateChecker } from '../behaviors/checkState';
import { PhysicsCalcProps } from './types';
import { RapierRigidBody } from '@react-three/rapier';
import { RefObject } from 'react';
import * as THREE from 'three';
import {
  characterConfigType,
  vehicleConfigType,
  airplaneConfigType
} from '../types';

export interface PhysicsConfig {
  character: characterConfigType;
  vehicle: vehicleConfigType;
  airplane: airplaneConfigType;
}

export class PhysicsEngine {
  private directionController = new DirectionController();
  private impulseController = new ImpulseController();
  private gravityController = new GravityController();
  private stateChecker = new StateChecker();
  private tempQuaternion = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();
  private config: PhysicsConfig;

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      character: { ...config?.character },
      vehicle: { ...config?.vehicle },
      airplane: { ...config?.airplane }
    };
  }

  public updateConfig(newConfig: Partial<PhysicsConfig>) {
    this.config = {
      character: { ...this.config.character, ...newConfig.character },
      vehicle: { ...this.config.vehicle, ...newConfig.vehicle },
      airplane: { ...this.config.airplane, ...newConfig.airplane }
    };
  }

  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    physicsState.activeState.velocity.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );
    this.stateChecker.checkAll(calcProp, physicsState);

    const { modeType = 'character' } = physicsState;

    switch (modeType) {
      case 'character':
        this.calculateCharacter(calcProp, physicsState);
        break;
      case 'vehicle':
        this.calculateVehicle(calcProp, physicsState);
        break;
      case 'airplane':
        this.calculateAirplane(calcProp, physicsState);
        break;
    }
  }

  private calculateCharacter(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionController.updateDirection(physicsState, 'normal', calcProp);
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.gravityController.applyGravity(rigidBodyRef, physicsState);

    if (rigidBodyRef?.current) {
      const {
        gameStates: { isJumping, isFalling, isNotMoving },
        activeState
      } = physicsState;
      const {
        linearDamping = 0.2,
        airDamping = 0.1,
        stopDamping = 2
      } = this.config.character;
      rigidBodyRef.current.setLinearDamping(
        isJumping || isFalling
          ? airDamping
          : isNotMoving
          ? linearDamping * stopDamping
          : linearDamping
      );
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
      if (innerGroupRef?.current) {
        innerGroupRef.current.quaternion.setFromEuler(activeState.euler);
      }
    }
  }

  private calculateVehicle(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    this.directionController.updateDirection(physicsState, 'normal', calcProp);
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);

    if (rigidBodyRef?.current) {
      rigidBodyRef.current.setEnabledRotations(false, true, false, false);
      this.tempEuler.set(0, physicsState.activeState.euler.y, 0);
      this.tempQuaternion.setFromEuler(this.tempEuler);
      rigidBodyRef.current.setRotation(this.tempQuaternion, true);
      if (innerGroupRef?.current) {
        innerGroupRef.current.rotation.y = 0;
      }
    }
  }

  private calculateAirplane(
    calcProp: PhysicsCalcProps,
    physicsState: PhysicsState
  ) {
    const { rigidBodyRef, innerGroupRef, matchSizes } = calcProp;
    this.directionController.updateDirection(
      physicsState,
      'normal',
      calcProp,
      innerGroupRef,
      matchSizes
    );
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.gravityController.applyGravity(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);
    if (rigidBodyRef?.current) {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  private applyDamping(rigidBodyRef: RefObject<RapierRigidBody>, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, keyboard } = physicsState;
    const { space } = keyboard;
    
    if (modeType === 'vehicle') {
      const { linearDamping = 0.9, brakeRatio = 5 } = this.config.vehicle;
      const damping = space ? brakeRatio : linearDamping;
      rigidBodyRef.current.setLinearDamping(damping);
    } else if (modeType === 'airplane') {
      const damping = this.config.airplane?.linearDamping || 0.8;
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }
}
