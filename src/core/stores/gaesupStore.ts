import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import { gaesupWorldContextType } from '../types/core';
import { UrlsSlice, createUrlsSlice } from './slices/urls';
import { ModeSlice, createModeSlice } from './slices/mode';
import { ClickerOptionSlice, createClickerOptionSlice } from './slices/clickerOption';
import { BlockSlice, createBlockSlice } from './slices/block';
import { CameraOptionSlice, createCameraOptionSlice } from './slices/cameraOption';
import { CameraSlice, createCameraSlice } from './slices/camera';
import { MinimapSlice, createMinimapSlice } from './slices/minimap';
import { InputSlice, createInputSlice } from './slices/input';
import { SizesSlice, createSizesSlice } from './slices/sizes';
import { AnimationSlice, createAnimationSlice } from './slices/animation';

export const gaesupWorldDefault: Partial<gaesupWorldContextType> = {
  activeState: {
    position: new THREE.Vector3(0, 5, 5),
    velocity: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    euler: new THREE.Euler(),
    dir: new THREE.Vector3(),
    direction: new THREE.Vector3(),
  },
  states: {
    rideableId: '',
    isMoving: false,
    isNotMoving: false,
    isOnTheGround: false,
    isOnMoving: false,
    isRotated: false,
    isRunning: false,
    isJumping: false,
    enableRiding: false,
    isRiderOn: false,
    isLanding: false,
    isFalling: false,
    isRiding: false,
    canRide: false,
    nearbyRideable: null,
    shouldEnterRideable: false,
    shouldExitRideable: false,
  },
  clicker: {
    point: new THREE.Vector3(0, 0, 0),
    angle: Math.PI / 2,
    isOn: false,
    isRun: false,
  },
  control: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
  },
  animationState: {
    character: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    vehicle: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
    airplane: {
      current: 'idle',
      default: 'idle',
      store: {},
    },
  },
  rideable: {},
  sizes: {},
  block: {
    camera: false,
    control: false,
    animation: false,
    scroll: true,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  refs: {},
};

export type StoreState = gaesupWorldContextType &
  UrlsSlice &
  ModeSlice &
  ClickerOptionSlice &
  BlockSlice &
  CameraOptionSlice &
  CameraSlice &
  MinimapSlice &
  InputSlice &
  SizesSlice &
  AnimationSlice & {
    updateState: (updates: Partial<StoreState>) => void;
    resetState: () => void;
    initializeState: (initialState: Partial<StoreState>) => void;
    setRefs: (refs: Partial<gaesupWorldContextType['refs']>) => void;
    setStates: (states: Partial<gaesupWorldContextType['states']>) => void;
  };

export const useGaesupStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((set, get, api) => ({
      ...gaesupWorldDefault,
      ...createUrlsSlice(set, get, api),
      ...createModeSlice(set, get, api),
      ...createClickerOptionSlice(set, get, api),
      ...createBlockSlice(set, get, api),
      ...createCameraOptionSlice(set, get, api),
      ...createCameraSlice(set, get, api),
      ...createMinimapSlice(set, get, api),
      ...createInputSlice(set, get, api),
      ...createSizesSlice(set, get, api),
      ...createAnimationSlice(set, get, api),

      updateState: (updates: Partial<StoreState>) => {
        set((state: StoreState) => {
          const newState = { ...state };
          Object.keys(updates).forEach((key) => {
            const typedKey = key as keyof StoreState;
            if (updates[typedKey] !== undefined) {
              (newState as any)[typedKey] = updates[typedKey];
            }
          });
          return newState;
        });
      },

      resetState: () => {
        set((state) => ({
          ...state,
          ...gaesupWorldDefault,
        }));
      },

      initializeState: (initialState: Partial<StoreState>) => {
        set((state: StoreState) => ({ ...state, ...initialState }));
      },

      setRefs: (refs: Partial<gaesupWorldContextType['refs']>) => {
        set((state: StoreState) => ({
          ...state,
          refs: { ...state.refs, ...refs },
        }));
      },

      setStates: (states: Partial<gaesupWorldContextType['states']>) => {
        set((state: StoreState) => ({
          ...state,
          states: { ...state.states, ...states },
        }));
      },
    })),
  ),
);

export const useGaesupContext = () => {
  const store = useGaesupStore();
  const { updateState, resetState, initializeState, ...state } = store;
  return state as Partial<gaesupWorldContextType>;
};

export const useGaesupDispatch = () => {
  const updateState = useGaesupStore((state) => state.updateState);
  return (action: { type: string; payload?: Partial<gaesupWorldContextType> }) => {
    switch (action.type) {
      case 'init':
        updateState(action.payload || {});
        break;
      case 'update':
        updateState(action.payload || {});
        break;
      default:
        break;
    }
  };
};

export const useGaesup = () => {
  const context = useGaesupContext();
  const dispatch = useGaesupDispatch();
  return { context, dispatch };
};
