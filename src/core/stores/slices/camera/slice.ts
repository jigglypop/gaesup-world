import { StateCreator } from 'zustand';
import { CameraSlice, CameraState, CameraTransition } from './types';
import * as THREE from 'three';

const createDefaultCameraState = (): CameraState => ({
    name: 'default',
    type: 'thirdPerson',
  position: new THREE.Vector3(0, 5, 10),
    rotation: new THREE.Euler(0, 0, 0),
    fov: 75,
  config: {
    distance: 10,
    height: 5,
    followSpeed: 0.1,
    rotationSpeed: 0.1,
  },
  priority: 0,
  tags: [],
});

const createDefaultTransitions = (): CameraTransition[] => [
  {
    from: 'character',
    to: 'vehicle',
    duration: 1.0,
    easing: 'easeInOut',
  },
  {
    from: 'vehicle',
    to: 'airplane',
    duration: 1.5,
    easing: 'easeOut',
  },
];

export const createCameraSlice: StateCreator<CameraSlice, [], [], CameraSlice> = (set) => ({
  cameraStates: new Map([['default', createDefaultCameraState()]]),
  cameraTransitions: createDefaultTransitions(),
  currentCameraStateName: 'default',
  cameraStateHistory: ['default'],
  setCameraStates: (states: Map<string, CameraState>) => {
    set({ cameraStates: states });
  },
  setCameraTransitions: (transitions: CameraTransition[]) => {
    set({ cameraTransitions: transitions });
  },
  setCurrentCameraStateName: (name: string) => {
    set((state) => ({
      currentCameraStateName: name,
      cameraStateHistory: [...state.cameraStateHistory, name],
    }));
  },
  setCameraStateHistory: (history: string[]) => {
    set({ cameraStateHistory: history });
  },
  addCameraState: (name: string, state: CameraState) => {
    set((prevState) => {
      const newStates = new Map(prevState.cameraStates);
      newStates.set(name, state);
      return { cameraStates: newStates };
    });
  },
});
