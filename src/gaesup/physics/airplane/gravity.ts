import { PhysicsCalc, PhysicsState } from '../type';

export default function gravity(
  rigidBodyRef: PhysicsCalc['rigidBodyRef'],
  physicsState: PhysicsState,
) {
  if (!rigidBodyRef.current) return;
  const { activeState } = physicsState;
  rigidBodyRef.current.setGravityScale(
    activeState.position.y < 10 ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1 : 0.1,
    false,
  );
}
