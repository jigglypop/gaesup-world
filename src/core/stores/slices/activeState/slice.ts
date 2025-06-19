import { StateCreator } from 'zustand';
import * as THREE from 'three';
import { ActiveStateSlice } from './types';

const createDefaultActiveState = () => ({
  position: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  quat: new THREE.Quaternion(0, 0, 0, 1),
  euler: new THREE.Euler(0, 0, 0),
  dir: new THREE.Vector3(0, 0, 0),
  direction: new THREE.Vector3(0, 0, 0),
});

export const createActiveStateSlice: StateCreator<ActiveStateSlice, [], [], ActiveStateSlice> = (
  set,
) => ({
  activeState: createDefaultActiveState(),
  setActiveState: (state) =>
    set(() => ({
      activeState: { ...createDefaultActiveState(), ...state },
    })),
  updateActiveState: (update) =>
    set((state) => ({
      activeState: state.activeState
        ? { ...state.activeState, ...update }
        : createDefaultActiveState(),
    })),
  resetActiveState: () =>
    set(() => ({
      activeState: createDefaultActiveState(),
    })),
});
