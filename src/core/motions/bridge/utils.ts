import { PhysicsInputState, PhysicsState } from '../types';

export const updateInputState = (state: PhysicsState, input: PhysicsInputState): void => {
  const keyboardKeys = ['forward', 'backward', 'leftward', 'rightward', 'shift', 'space', 'keyE', 'keyR'] as const;
  
  keyboardKeys.forEach(key => {
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
    }
  });

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
}; 