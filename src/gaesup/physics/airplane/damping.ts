import { PhysicsState, commonPhysics, PhysicsRefs } from '../types';

export default function damping(
  rigidBodyRef: PhysicsRefs['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  const { airplaneConfig } = physicsState;
  const { linearDamping = 1 } = airplaneConfig || {};
  commonPhysics.applyDamping(rigidBodyRef, { linearDamping });
}
