'use client';
import { useAtomValue } from 'jotai';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import * as THREE from 'three';
import {
  activeStateAtom,
  modeStateAtom,
  urlsStateAtom,
  gameStatesAtom,
  animationStateAtom,
  rideableStateAtom,
  sizesStateAtom,
  controllerConfigAtom,
} from './coreStateAtoms';
import { gaesupDisptachType, gaesupWorldContextType } from './types';

export function gaesupWorldReducer(
  props: Partial<gaesupWorldContextType>,
  action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
  },
) {
  switch (action.type) {
    case 'init':
      return { ...props };
    case 'update':
      return { ...props, ...action.payload };
    default:
      return props;
  }
}

export const GaesupContext = createContext<Partial<gaesupWorldContextType>>({});
export const GaesupDispatchContext = createContext<gaesupDisptachType>(() => {});

interface GaesupProviderProps {
  children: ReactNode;
  initialState?: Partial<gaesupWorldContextType>;
}

// Export default state for compatibility
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
};

export function GaesupProvider({ children, initialState = {} }: GaesupProviderProps) {
  // Atoms에서 기본값들 가져오기 (중복 제거)
  const activeState = useAtomValue(activeStateAtom);
  const mode = useAtomValue(modeStateAtom);
  const urls = useAtomValue(urlsStateAtom);
  const gameStates = useAtomValue(gameStatesAtom);
  const animationState = useAtomValue(animationStateAtom);
  const rideable = useAtomValue(rideableStateAtom);
  const sizes = useAtomValue(sizesStateAtom);
  const controllerConfig = useAtomValue(controllerConfigAtom);

  const defaultState: Partial<gaesupWorldContextType> = {
    activeState,
    mode,
    urls,
    states: gameStates,
    animationState,
    rideable,
    sizes,
    ...controllerConfig,
    // 기타 설정들
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
  };

  const [state, dispatch] = useReducer(gaesupWorldReducer, {
    ...defaultState,
    ...initialState,
  });

  return (
    <GaesupContext.Provider value={state}>
      <GaesupDispatchContext.Provider value={dispatch}>{children}</GaesupDispatchContext.Provider>
    </GaesupContext.Provider>
  );
}

export function useGaesup() {
  const context = useContext(GaesupContext);
  const dispatch = useContext(GaesupDispatchContext);
  if (!context || !dispatch) {
    throw new Error('useGaesup must be used within GaesupProvider');
  }
  return { context, dispatch };
}

export function useGaesupContext() {
  return useContext(GaesupContext);
}

export function useGaesupDispatch() {
  return useContext(GaesupDispatchContext);
}
