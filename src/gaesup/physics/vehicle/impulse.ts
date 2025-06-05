import { PhysicsCalc, PhysicsState } from '../type';

export default function impulse(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;

  const { activeState, keyboard, vehicleConfig } = physicsState;
  const { shift } = keyboard;
  const { maxSpeed = 60, accelRatio = 2 } = vehicleConfig || {};

  const velocity = rigidBodyRef.current.linvel();
  const V = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);

  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = shift ? accelRatio : 1;

    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      {
        x: activeState.dir.x * speed * M,
        y: activeState.dir.y * speed * M,
        z: activeState.dir.z * speed * M,
      },
      false,
    );
  }
}
