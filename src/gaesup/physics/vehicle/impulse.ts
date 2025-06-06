import { PhysicsState, commonPhysics, PhysicsRefs } from '../types';

export default function impulse(
  rigidBodyRef: PhysicsRefs['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  const { activeState, keyboard, vehicleConfig } = physicsState;
  const { shift } = keyboard;
  const { maxSpeed = 60, accelRatio = 2 } = vehicleConfig || {};
  const boost = shift ? accelRatio : 1;

  commonPhysics.applyImpulse(rigidBodyRef, activeState.dir, { maxSpeed, boost });
}
