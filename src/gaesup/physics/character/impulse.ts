import { physicsEventBus } from '../stores/physicsEventBus';
import { PhysicsCalc, PhysicsState } from '../type';

export function impulse(rigidBodyRef: PhysicsCalc['rigidBodyRef'], physicsState: PhysicsState) {
  if (!rigidBodyRef.current) return;
  const {
    gameStates: { isMoving, isRunning, isOnTheGround, isJumping },
    activeState,
    characterConfig,
  } = physicsState;
  const { walkSpeed = 10, runSpeed = 20, jumpSpeed = 15 } = characterConfig;
  if (isJumping && isOnTheGround) {
    const currentVel = rigidBodyRef.current.linvel();
    rigidBodyRef.current.setLinvel({ x: currentVel.x, y: jumpSpeed, z: currentVel.z }, true);
    physicsEventBus.emit('JUMP_STATE_CHANGE', {
      isJumping: false,
      isOnTheGround: true,
    });
  }
  if (isMoving) {
    const speed = isRunning ? runSpeed : walkSpeed;
    const dir = activeState.dir;
    const vel = activeState.velocity;
    const M = rigidBodyRef.current.mass();
    const targetVelX = -dir.x * speed;
    const targetVelZ = -dir.z * speed;
    const accelX = targetVelX - vel.x;
    const accelZ = targetVelZ - vel.z;
    const forceX = accelX * M;
    const forceZ = accelZ * M;
    rigidBodyRef.current.applyImpulse({ x: forceX, y: 0, z: forceZ }, true);
  }
}
