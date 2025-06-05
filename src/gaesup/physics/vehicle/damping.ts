import { PhysicsCalc, PhysicsState } from '../type';

export default function damping(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;

  const { keyboard, vehicleConfig } = physicsState;
  const { space } = keyboard;
  const { brakeRatio = 5, linearDamping = 0.5 } = vehicleConfig || {};
  rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}
