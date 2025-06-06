import { PhysicsState, commonPhysics, PhysicsRefs } from '../types';

export default function impulse(
  rigidBodyRef: PhysicsRefs['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  const { activeState, airplaneConfig } = physicsState;
  const { maxSpeed = 60 } = airplaneConfig || {};

  commonPhysics.applyImpulse(rigidBodyRef, activeState.direction, { maxSpeed });
}
