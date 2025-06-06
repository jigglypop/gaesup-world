'use client';
import { GroupProps } from '@react-three/fiber';
import { euler, quat, vec3 } from '@react-three/rapier';
import { useAtomValue } from 'jotai';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import * as THREE from 'three';
import { modeStateAtom } from '../atoms/coreStateAtoms';
import { callbackType } from '../controller/initialize/callback/type';
import { rideableType } from '../hooks/useRideable/type';
import {
  ActionsType,
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  DispatchType,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
  actionsType,
} from '../types';
import { dispatchType } from '../utils/type';
import { V3 } from '../utils/vector';
export type {
  ActionsType,
  ActiveStateType,
  AnimationAtomType,
  AnimationStatePropType,
  AnimationStateType,
  BlockType,
  CameraOptionDebugType,
  CameraOptionType,
  ClickerOptionType,
  ClickerType,
  ControlState,
  GameStatesType,
  KeyboardControlState,
  ModeType,
  PassiveStateType,
  PortalType,
  PortalsType,
  QueueActionType,
  QueueFunctionType,
  QueueItemType,
  QueueType,
  RefsType,
  ResourceUrlsType,
  SizeType,
  SizesType,
  WheelStateType,
  WheelsStateType,
};
export type animationPropType = {
  current: string;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
  store: {};
  default: string;
};
export type airplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};
export type vehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};
export type characterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
  jumpGravityScale?: number;
  normalGravityScale?: number;
  airDamping?: number;
  stopDamping?: number;
};
export interface airplaneType extends GroupProps, airplaneDebugType {}
export interface vehicleType extends GroupProps, vehicleDebugType {}
export interface characterType extends GroupProps, characterDebugType {}
export type gaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: ResourceUrlsType;
  states: GameStatesType;
  control: KeyboardControlState<string>;
  refs?: RefsType;
  animationState: AnimationStateType;
  clickerOption: ClickerOptionType;
  clicker: ClickerType;
  rideable: { [key: string]: rideableType };
  sizes: SizesType;
  block: BlockType;
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  callbacks: callbackType;
  controllerOptions: {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
};
export type gaesupDisptachType = DispatchType<gaesupWorldContextType>;
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
export const gaesupWorldDefault: Partial<gaesupWorldContextType> = {
  activeState: {
    position: V3(0, 5, 5),
    velocity: vec3(),
    quat: quat(),
    euler: euler(),
    dir: vec3(),
    direction: vec3(),
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
    point: V3(0, 0, 0),
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
  airplane: {
    angleDelta: V3(Math.PI / 256, Math.PI / 256, Math.PI / 256),
    maxAngle: V3(Math.PI / 8, Math.PI / 8, Math.PI / 8),
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    buoyancy: 0.2,
    linearDamping: 1,
  },
  vehicle: {
    maxSpeed: 60,
    accelRatio: 2,
    brakeRatio: 5,
    wheelOffset: 0.1,
    linearDamping: 0.5,
  },
  character: {
    walkSpeed: 10,
    runSpeed: 20,
    turnSpeed: 10,
    jumpSpeed: 15,
    linearDamping: 1,
    jumpGravityScale: 1.5,
    normalGravityScale: 1.0,
    airDamping: 0.1,
    stopDamping: 3,
  },
  callbacks: {
    onReady: () => {},
    onFrame: () => {},
    onDestory: () => {},
    onAnimate: () => {},
  },
  controllerOptions: {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  },
};
export const GaesupContext = createContext<Partial<gaesupWorldContextType>>(gaesupWorldDefault);
export const GaesupDispatchContext = createContext<dispatchType<Partial<gaesupWorldContextType>>>(
  () => {},
);
interface GaesupProviderProps {
  children: ReactNode;
  initialState?: Partial<gaesupWorldContextType>;
}
export function GaesupProvider({ children, initialState = {} }: GaesupProviderProps) {
  const [state, dispatch] = useReducer(gaesupWorldReducer, {
    ...gaesupWorldDefault,
    ...initialState,
  });
  const modeState = useAtomValue(modeStateAtom);
  useEffect(() => {
    dispatch({
      type: 'update',
      payload: { mode: modeState },
    });
  }, [modeState]);
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

export const createStateUpdater = <T extends keyof gaesupWorldContextType>(
  dispatch: dispatchType<Partial<gaesupWorldContextType>>,
  stateKey: T,
) => {
  return (updates: Partial<gaesupWorldContextType[T]>) => {
    dispatch({
      type: 'update',
      payload: {
        [stateKey]: updates,
      },
    });
  };
};
