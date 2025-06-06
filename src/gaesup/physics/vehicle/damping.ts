import { PhysicsState, commonPhysics, PhysicsRefs } from '../types';

export default function damping(
  rigidBodyRef: PhysicsRefs['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  const { keyboard, vehicleConfig } = physicsState;
  const { space } = keyboard;
  const { brakeRatio = 5, linearDamping = 0.5 } = vehicleConfig || {};

  commonPhysics.applyDamping(rigidBodyRef, {
    linearDamping,
    condition: space,
    brakeRatio,
  });
}
