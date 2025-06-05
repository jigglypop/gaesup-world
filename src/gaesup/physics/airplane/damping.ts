import { PhysicsCalc, PhysicsState } from '../type';

export default function damping(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;
  const { airplaneConfig } = physicsState;
  const { linearDamping = 1 } = airplaneConfig || {};
  rigidBodyRef.current.setLinearDamping(linearDamping);
}
