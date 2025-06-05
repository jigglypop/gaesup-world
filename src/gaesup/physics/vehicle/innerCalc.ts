import { quat } from '@react-three/rapier';
import { PhysicsCalc, PhysicsState } from '../type';

export default function innerCalc(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;

  const { activeState } = physicsState;

  // 기존 객체에 copy
  const translation = rigidBodyRef.current.translation();
  activeState.position.set(translation.x, translation.y, translation.z);

  const velocity = rigidBodyRef.current.linvel();
  activeState.velocity.set(velocity.x, velocity.y, velocity.z);

  rigidBodyRef.current.setRotation(quat().setFromEuler(activeState.euler.clone()), false);
}
