import { TransformStore } from '../TransformStore';

const POSITION_STRIDE = 3;

export type CharacterInput = {
  moveX: number;
  moveZ: number;
  jump: boolean;
  run: boolean;
};

export type CharacterMotionConfig = {
  walkSpeed: number;
  runSpeed: number;
  acceleration: number;
  airControl: number;
  jumpSpeed: number;
  gravity: number;
  groundY: number;
};

export type CharacterMotionState = {
  velocity: Float32Array;
  yaw: number;
  grounded: boolean;
  moving: boolean;
};

export const DEFAULT_CHARACTER_MOTION_CONFIG: CharacterMotionConfig = {
  walkSpeed: 6,
  runSpeed: 11,
  acceleration: 12,
  airControl: 0.25,
  jumpSpeed: 9,
  gravity: 24,
  groundY: 0,
};

export function createCharacterMotionState(): CharacterMotionState {
  return {
    velocity: new Float32Array(3),
    yaw: 0,
    grounded: true,
    moving: false,
  };
}

export function stepCharacterMotion(
  store: TransformStore,
  index: number,
  state: CharacterMotionState,
  input: CharacterInput,
  config: CharacterMotionConfig,
  deltaTime: number,
): void {
  const velocity = state.velocity;
  const inputLength = Math.hypot(input.moveX, input.moveZ);
  const normalizedX = inputLength > 0 ? input.moveX / inputLength : 0;
  const normalizedZ = inputLength > 0 ? input.moveZ / inputLength : 0;
  const targetSpeed = inputLength > 0 ? (input.run ? config.runSpeed : config.walkSpeed) : 0;
  const desiredX = normalizedX * targetSpeed;
  const desiredZ = normalizedZ * targetSpeed;
  const control = state.grounded ? 1 : config.airControl;
  const blend = Math.min(1, config.acceleration * control * deltaTime);
  velocity[0] = (velocity[0] ?? 0) + (desiredX - (velocity[0] ?? 0)) * blend;
  velocity[2] = (velocity[2] ?? 0) + (desiredZ - (velocity[2] ?? 0)) * blend;
  if (state.grounded && input.jump) {
    velocity[1] = config.jumpSpeed;
    state.grounded = false;
  } else if (!state.grounded) {
    velocity[1] = (velocity[1] ?? 0) - config.gravity * deltaTime;
  }
  const offset = index * POSITION_STRIDE;
  const nextX = (store.positions[offset] ?? 0) + (velocity[0] ?? 0) * deltaTime;
  let nextY = (store.positions[offset + 1] ?? 0) + (velocity[1] ?? 0) * deltaTime;
  const nextZ = (store.positions[offset + 2] ?? 0) + (velocity[2] ?? 0) * deltaTime;
  if (nextY <= config.groundY) {
    nextY = config.groundY;
    velocity[1] = 0;
    state.grounded = true;
  }
  store.setPosition(index, nextX, nextY, nextZ);
  const horizontalSpeed = Math.hypot(velocity[0] ?? 0, velocity[2] ?? 0);
  state.moving = horizontalSpeed > 0.1;
  if (state.moving) {
    state.yaw = Math.atan2(velocity[0] ?? 0, velocity[2] ?? 0);
  }
  const halfYaw = state.yaw / 2;
  store.setRotation(index, 0, Math.sin(halfYaw), 0, Math.cos(halfYaw));
}
