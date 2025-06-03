import { PhysicsCalc, PhysicsState } from '../type';

export function gravity(rigidBodyRef: PhysicsCalc['rigidBodyRef'], physicsState: PhysicsState) {
  if (!rigidBodyRef.current) return;
  const {
    gameStates: { isJumping, isFalling },
    characterConfig: { jumpGravityScale = 1.5, normalGravityScale = 1.0 },
  } = physicsState;
  if (isJumping || isFalling) {
    rigidBodyRef.current.setGravityScale(jumpGravityScale, false);
  } else {
    rigidBodyRef.current.setGravityScale(normalGravityScale, false);
  }
}
