import { PhysicsState, PhysicsCalculationProps } from '../types';

export const updateInputState = (state: PhysicsState, input: PhysicsCalculationProps): void => {
  const keyboardKeys = ['forward', 'backward', 'leftward', 'rightward', 'shift', 'space', 'keyE', 'keyR'] as const;
  
  keyboardKeys.forEach(key => {
    if (state.keyboard[key] !== input.keyboard[key]) {
      state.keyboard[key] = input.keyboard[key];
    }
  });

  if (!state.mouse.target.equals(input.mouse.target)) {
    state.mouse.target.copy(input.mouse.target);
  }
  
  const mouseProps = ['angle', 'isActive', 'shouldRun'] as const;
  mouseProps.forEach(prop => {
    if (state.mouse[prop] !== input.mouse[prop]) {
      state.mouse[prop] = input.mouse[prop];
    }
  });
}; 