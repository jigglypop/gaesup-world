import { PhysicsCalcProps, PhysicsState } from './types';
import { DirectionController } from './controllers/DirectionController';
import { ImpulseController } from './controllers/ImpulseController';
import { GravityController } from './controllers/GravityController';
import { StateChecker } from './controllers/StateChecker';

export class PhysicsEngine {
  private directionController = new DirectionController();
  private impulseController = new ImpulseController();
  private gravityController = new GravityController();
  private stateChecker = new StateChecker();

  calculate(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    if (!physicsState) return;

    this.stateChecker.checkAll(calcProp, physicsState);

    switch (physicsState.modeType) {
      case 'character':
        this.calculateCharacter(calcProp, physicsState);
        break;
      case 'vehicle':
        this.calculateVehicle(calcProp, physicsState);
        break;
      case 'airplane':
        this.calculateAirplane(calcProp, physicsState);
        break;
      default:
        this.calculateCharacter(calcProp, physicsState);
    }
  }

  private calculateCharacter(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const { rigidBodyRef, innerGroupRef } = calcProp;
    const controlMode = (calcProp.worldContext as any)?.mode?.control;

    this.directionController.updateDirection(physicsState, controlMode, calcProp);
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.gravityController.applyGravity(rigidBodyRef, physicsState);
    this.calculateInner(rigidBodyRef, innerGroupRef, physicsState);
  }

  private calculateVehicle(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const { rigidBodyRef } = calcProp;

    this.directionController.updateDirection(physicsState, 'normal', calcProp);
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);
    this.checkLanding(physicsState);
    this.calculateInner(rigidBodyRef, null, physicsState);
  }

  private calculateAirplane(calcProp: PhysicsCalcProps, physicsState: PhysicsState): void {
    const { rigidBodyRef, innerGroupRef, matchSizes } = calcProp;

    this.directionController.updateDirection(
      physicsState,
      'normal',
      calcProp,
      innerGroupRef,
      matchSizes,
    );
    this.impulseController.applyImpulse(rigidBodyRef, physicsState);
    this.applyDamping(rigidBodyRef, physicsState);
    this.gravityController.applyGravity(rigidBodyRef, physicsState);
    this.checkLanding(physicsState);
    this.calculateInner(rigidBodyRef, null, physicsState);
  }

  private calculateInner(rigidBodyRef: any, innerGroupRef: any, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current) return;

    const { modeType } = physicsState;

    if (modeType === 'character' && innerGroupRef?.current) {
      const {
        gameStates: { isJumping, isFalling, isNotMoving },
        activeState,
        characterConfig: { linearDamping = 1, airDamping = 0.1, stopDamping = 3 },
      } = physicsState;

      if (isJumping || isFalling) {
        rigidBodyRef.current.setLinearDamping(airDamping);
      } else {
        rigidBodyRef.current.setLinearDamping(
          isNotMoving ? linearDamping * stopDamping : linearDamping,
        );
      }
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
      innerGroupRef.current.quaternion.setFromEuler(activeState.euler);
    } else {
      rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  private applyDamping(rigidBodyRef: any, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current) return;

    const { modeType } = physicsState;

    if (modeType === 'vehicle') {
      const damping = (physicsState.vehicleConfig as any)?.damping || 0.9;
      rigidBodyRef.current.setLinearDamping(damping);
    } else if (modeType === 'airplane') {
      const damping = (physicsState.airplaneConfig as any)?.damping || 0.8;
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }

  private checkLanding(physicsState: PhysicsState): void {
    const {
      gameStates: { isOnTheGround },
      characterConfig,
    } = physicsState;

    if (isOnTheGround) {
      // Landing logic if needed
    }
  }
}
