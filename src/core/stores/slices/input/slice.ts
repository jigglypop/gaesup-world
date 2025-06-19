import { StateCreator } from 'zustand';
import { InputSlice, KeyboardInputState, MouseInputState } from './types';
import * as THREE from 'three';

export const createInputSlice: StateCreator<InputSlice, [], [], InputSlice> = (set, _) => ({
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
      target: new THREE.Vector3(0, 0, 0),
      angle: 0,
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
      isRun: false,
      throttle: 100,
      autoStart: false,
      track: false,
      loop: false,
      queue: [],
      line: true,
    },
  },
  setKeyboard: (update: Partial<KeyboardInputState>) => {
    set((state) => ({
      input: {
        ...state.input,
        keyboard: {
          ...state.input.keyboard,
          ...update,
        },
      },
    }));
  },
  setPointer: (update: Partial<MouseInputState>) => {
    set((state) => ({
      input: {
        ...state.input,
        pointer: {
          ...state.input.pointer,
          ...update,
        },
      },
    }));
  },
});
