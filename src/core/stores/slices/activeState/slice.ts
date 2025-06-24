import { StateCreator } from 'zustand';
import * as THREE from 'three';
import { ActiveStateSlice, ActiveState } from './types';

const initialActiveState: ActiveState = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  euler: new THREE.Euler(),
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  angular: new THREE.Vector3(),
  isGround: false,
};

export const createActiveStateSlice: StateCreator<ActiveStateSlice, [], [], ActiveStateSlice> = (
  set,
) => ({
  activeState: initialActiveState,
  setActiveState: (state) =>
    set(() => ({
      activeState: { ...initialActiveState, ...state },
    })),
  updateActiveState: (update) =>
    set((state) => ({
      activeState: state.activeState
        ? { ...state.activeState, ...update }
        : initialActiveState,
    })),
  resetActiveState: () =>
    set(() => ({
      activeState: initialActiveState,
    })),
});
