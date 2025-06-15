import { StateCreator } from 'zustand';
import * as THREE from 'three';
import { CameraState, CameraTransition } from '../../types';

const defaultStates: CameraState[] = [
  {
    name: 'default',
    type: 'thirdPerson',
    position: new THREE.Vector3(-10, 10, -10),
    rotation: new THREE.Euler(0, 0, 0),
    fov: 75,
    config: {},
    priority: 0,
    tags: ['gameplay'],
  },
  {
    name: 'combat',
    type: 'shoulder',
    position: new THREE.Vector3(-2, 2, -5),
    rotation: new THREE.Euler(0, 0, 0),
    fov: 60,
    config: { shoulderOffset: new THREE.Vector3(1, 1.6, -3) },
    priority: 10,
    tags: ['combat', 'action'],
  },
  {
    name: 'dialogue',
    type: 'fixed',
    position: new THREE.Vector3(0, 2, 5),
    rotation: new THREE.Euler(0, Math.PI, 0),
    fov: 50,
    config: {},
    priority: 20,
    tags: ['cutscene', 'dialogue'],
  },
];

const initialStates = new Map<string, CameraState>(defaultStates.map((s) => [s.name, s]));

export interface CameraSlice {
  cameraStates: Map<string, CameraState>;
  cameraTransitions: CameraTransition[];
  currentCameraStateName: string;
  cameraStateHistory: string[];
  setCameraStates: (states: Map<string, CameraState>) => void;
  setCameraTransitions: (transitions: CameraTransition[]) => void;
  setCurrentCameraStateName: (name: string) => void;
  setCameraStateHistory: (history: string[]) => void;
  addCameraState: (name: string, state: CameraState) => void;
}

export const createCameraSlice: StateCreator<CameraSlice, [], [], CameraSlice> = (set) => ({
  cameraStates: initialStates,
  cameraTransitions: [],
  currentCameraStateName: 'default',
  cameraStateHistory: [],
  setCameraStates: (states) => set({ cameraStates: states }),
  setCameraTransitions: (transitions) => set({ cameraTransitions: transitions }),
  setCurrentCameraStateName: (name) => set({ currentCameraStateName: name }),
  setCameraStateHistory: (history) => set({ cameraStateHistory: history }),
  addCameraState: (name, state) =>
    set((s) => ({
      cameraStates: new Map(s.cameraStates).set(name, state),
    })),
});
