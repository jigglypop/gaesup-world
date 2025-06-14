import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';
import { gaesupWorldContextType } from '../atoms/types';

export const gaesupWorldDefault: Partial<gaesupWorldContextType> = {
  activeState: {
    position: new THREE.Vector3(0, 5, 5),
    velocity: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    euler: new THREE.Euler(),
    dir: new THREE.Vector3(),
    direction: new THREE.Vector3(),
  },
  mode: {
    type: 'character',
    controller: 'clicker',
    control: 'chase',
  },
  urls: {
    characterUrl: '',
    vehicleUrl: '',
    airplaneUrl: '',
    wheelUrl: '',
    ridingUrl: '',
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
  clickerOption: {
    isRun: true,
    throttle: 100,
    autoStart: false,
    track: false,
    loop: false,
    queue: [],
    line: false,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  refs: {},
};

interface GaesupStoreState extends Partial<gaesupWorldContextType> {
  updateState: (updates: Partial<gaesupWorldContextType>) => void;
  resetState: () => void;
  initializeState: (initialState: Partial<gaesupWorldContextType>) => void;
  setRefs: (refs: Partial<gaesupWorldContextType['refs']>) => void;
  setStates: (states: Partial<gaesupWorldContextType['states']>) => void;
}

export const useGaesupStore = create<GaesupStoreState>()(
  subscribeWithSelector((set, get) => ({
    ...gaesupWorldDefault,

    updateState: (updates) => {
      set((state) => ({ ...state, ...updates }));
    },

    resetState: () => {
      set({ ...gaesupWorldDefault });
    },

    initializeState: (initialState) => {
      set((state) => ({ ...gaesupWorldDefault, ...initialState }));
    },

    setRefs: (refs) => {
      set((state) => ({
        ...state,
        refs: { ...state.refs, ...refs },
      }));
    },

    setStates: (states) => {
      set((state) => ({
        ...state,
        states: { ...state.states, ...states },
      }));
    },
  })),
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
