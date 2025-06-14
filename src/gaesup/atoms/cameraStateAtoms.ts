import { atom } from 'jotai';
import * as THREE from 'three';
import { CameraState, CameraTransition } from '../types';

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

export const cameraStatesAtom = atom<Map<string, CameraState>>(initialStates);
export const cameraTransitionsAtom = atom<CameraTransition[]>([]);
export const currentCameraStateNameAtom = atom<string>('default');
export const cameraStateHistoryAtom = atom<string[]>([]);

export const currentCameraStateAtom = atom((get) => {
  const states = get(cameraStatesAtom);
  const currentName = get(currentCameraStateNameAtom);
  return states.get(currentName);
});
