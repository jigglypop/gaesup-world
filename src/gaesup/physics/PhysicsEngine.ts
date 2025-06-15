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
    if (!physicsState || !calcProp.rigidBodyRef.current) return;
    const currentVelocity = calcProp.rigidBodyRef.current.linvel();
    physicsState.activeState.velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z);
    this.stateChecker.checkAll(calcProp, physicsState);
    const { rigidBodyRef, innerGroupRef, matchSizes, worldContext } = calcProp;
    const { modeType = 'character' } = physicsState;
    const controlMode = (worldContext as any)?.mode?.control;
    this.directionController.updateDirection(
      physicsState,
      modeType === 'character' ? controlMode : 'normal',
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
  private applyDamping(rigidBodyRef: any, physicsState: PhysicsState): void {
    if (!rigidBodyRef?.current || !physicsState) return;
    const { modeType, vehicleConfig, airplaneConfig } = physicsState;
    let damping = 0;
    if (modeType === 'vehicle') {
      damping = (vehicleConfig as any)?.damping || 0.9;
    } else if (modeType === 'airplane') {
      damping = (airplaneConfig as any)?.damping || 0.8;
    }
    if (damping > 0) {
      rigidBodyRef.current.setLinearDamping(damping);
    }
  }
}
