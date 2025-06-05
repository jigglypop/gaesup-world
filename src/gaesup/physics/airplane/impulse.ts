import { PhysicsCalc, PhysicsState } from '../type';

export default function impulse(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;

  const { activeState, airplaneConfig } = physicsState;
  const { maxSpeed = 60 } = airplaneConfig || {};

  const velocity = rigidBodyRef.current.linvel();
  const V = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);

  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      {
        x: activeState.direction.x * M,
        y: activeState.direction.y * M,
        z: activeState.direction.z * M,
      },
      false,
    );
  }
}
