import { StateCreator } from 'zustand';
import { ModeSlice, ModeState, ControllerOptionsType } from './types';

const initialModeState: ModeState = {
  type: 'character',
  controller: 'keyboard',
  control: 'thirdPerson',
};

const initialControllerOptions: ControllerOptionsType = {
  lerp: {
    cameraTurn: 1,
    cameraPosition: 1,
  },
};

export const createModeSlice: StateCreator<ModeSlice, [], [], ModeSlice> = (set) => ({
  mode: initialModeState,
  controllerOptions: initialControllerOptions,
  setMode: (update) =>
    set((state) => ({
      mode: { ...state.mode, ...update },
    })),
  setControllerOptions: (update) =>
    set((state) => ({
      controllerOptions: { ...state.controllerOptions, ...update },
    })),
});
