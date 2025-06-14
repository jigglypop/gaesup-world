import { StateCreator } from 'zustand';
import { KeyboardInputState, MouseInputState, inputState } from '../../../types';
import { V3 } from '../../utils/vector';

// Slice Interface
export interface InputSlice {
  input: inputState;
  movement: () => {
    isMoving: boolean;
    isRunning: boolean;
    isJumping: boolean;
    inputSource: 'keyboard' | 'pointer' | 'none';
    isKeyboardMoving: boolean;
    isPointerMoving: boolean;
  };
  setKeyboard: (update: Partial<KeyboardInputState>) => void;
  setPointer: (update: Partial<MouseInputState>) => void;
}

export const createInputSlice: StateCreator<InputSlice, [], [], InputSlice> = (set, get) => ({
  input: {
    keyboard: {
      forward: false,
      backward: false,
      leftward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false,
    },
    pointer: {
      target: V3(0, 0, 0),
      angle: Math.PI / 2,
      isActive: false,
      shouldRun: false,
    },
    gamepad: {
      connected: false,
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
      buttons: {},
    },
    clickerOption: {
      isRun: true,
      throttle: 100,
      autoStart: false,
      track: false,
      loop: false,
      queue: [],
      line: false,
    },
  },
  movement: () => {
    const { input } = get();
    const isKeyboardMoving =
      input.keyboard.forward ||
      input.keyboard.backward ||
      input.keyboard.leftward ||
      input.keyboard.rightward;
    const isPointerMoving = input.pointer.isActive;
    return {
      isMoving: isKeyboardMoving || isPointerMoving,
      isRunning:
        (input.keyboard.shift && isKeyboardMoving) ||
        (input.pointer.shouldRun && isPointerMoving && input.clickerOption.isRun),
      isJumping: input.keyboard.space,
      inputSource: isKeyboardMoving ? 'keyboard' : isPointerMoving ? 'pointer' : 'none',
      isKeyboardMoving,
      isPointerMoving,
    };
  },
  setKeyboard: (update) =>
    set((state) => ({
      input: {
        ...state.input,
        keyboard: { ...state.input.keyboard, ...update },
      },
    })),
  setPointer: (update) =>
    set((state) => ({
      input: {
        ...state.input,
        pointer: { ...state.input.pointer, ...update },
      },
    })),
});
