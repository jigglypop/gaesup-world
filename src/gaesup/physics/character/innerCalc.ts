import { PhysicsCalc, PhysicsState } from '../type';

export function innerCalc(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  innerGroupRef: PhysicsCalc['innerGroupRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current || !innerGroupRef.current) return;
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
}
