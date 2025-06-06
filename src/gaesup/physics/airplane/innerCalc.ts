import { quat } from '@react-three/rapier';
import { PhysicsCalc, PhysicsState } from '../type';

export default function innerCalc(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;
  const { activeState } = physicsState;
  const translation = rigidBodyRef.current.translation();
  activeState.position.set(translation.x, translation.y, translation.z);
  const velocity = rigidBodyRef.current.linvel();
  activeState.velocity.set(velocity.x, velocity.y, velocity.z);
  const _euler = activeState.euler.clone();
  _euler.x = 0;
  _euler.z = 0;
  rigidBodyRef.current.setRotation(quat().setFromEuler(_euler), true);
}
