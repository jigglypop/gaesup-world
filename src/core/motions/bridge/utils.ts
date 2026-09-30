import { PhysicsInputState, PhysicsState } from '../types';

const KEYBOARD_KEYS = ['forward', 'backward', 'leftward', 'rightward', 'shift', 'space', 'keyE', 'keyR', 'keyF', 'keyZ', 'escape'] as const;

export const updateInputState = (state: PhysicsState, input: PhysicsInputState): void => {
  state.gamepad = input.gamepad;
  for (let i = 0; i < KEYBOARD_KEYS.length; i++) {
    const key = KEYBOARD_KEYS[i]!;
    if (state.keyboard[key] !== input.keyboard[key]) state.keyboard[key] = input.keyboard[key];
  }

  if (!state.mouse.target.equals(input.mouse.target)) {
    state.mouse.target.copy(input.mouse.target);
  }

  if (state.mouse.angle !== input.mouse.angle) {
    state.mouse.angle = input.mouse.angle;
  }
  if (state.mouse.isActive !== input.mouse.isActive) {
    state.mouse.isActive = input.mouse.isActive;
  }
  if (state.mouse.shouldRun !== input.mouse.shouldRun) {
    state.mouse.shouldRun = input.mouse.shouldRun;
  }
  if (input.mouse.isLookAround === undefined) delete state.mouse.isLookAround;
  else state.mouse.isLookAround = input.mouse.isLookAround;
};
