import { euler, quat, vec3 } from '@react-three/rapier';
import { atom } from 'jotai';
import * as THREE from 'three';
import { minimapInnerType } from '../tools/minimap/type';
import { AnimationAtomType } from '../types';
import { inputAtom, movementStateAtom } from './inputAtom';

export interface ActiveState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  dir: THREE.Vector3;
  direction: THREE.Vector3;
}

export const activeStateAtom = atom<ActiveState>({
  position: vec3({
    x: 0,
    y: 5,
    z: 5,
  }),
  velocity: vec3(),
  quat: quat(),
  euler: euler(),
  dir: vec3(),
  direction: vec3(),
});

export interface ModeState {
  type: 'character' | 'vehicle' | 'airplane';
  controller: 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
  control: 'chase' | 'firstPerson' | 'topDown';
}

export const modeStateAtom = atom<ModeState>({
  type: 'character',
  controller: 'clicker',
  control: 'chase',
});

export interface UrlsState {
  characterUrl: string | null;
  vehicleUrl: string | null;
  airplaneUrl: string | null;
  wheelUrl: string | null;
  ridingUrl: string | null;
}

export const urlsStateAtom = atom<UrlsState>({
  characterUrl: null,
  vehicleUrl: null,
  airplaneUrl: null,
  wheelUrl: null,
  ridingUrl: null,
});

export interface GameStates {
  rideableId: string | null;
  isMoving: boolean;
  isNotMoving: boolean;
  isOnTheGround: boolean;
  isOnMoving: boolean;
  isRotated: boolean;
  isRunning: boolean;
  isJumping: boolean;
  enableRiding: boolean;
  isRiderOn: boolean;
  isLanding: boolean;
  isFalling: boolean;
  isRiding: boolean;
  canRide: boolean;
  nearbyRideable: {
    objectkey: string;
    objectType: 'vehicle' | 'airplane';
    name: string;
  } | null;
  shouldEnterRideable: boolean;
  shouldExitRideable: boolean;
}

export const gameStatesAtom = atom<GameStates>({
  rideableId: null,
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
});

export interface AnimationState {
  character: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
  vehicle: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
  airplane: {
    current: string;
    default: string;
    store: Record<string, AnimationAtomType>;
  };
}

export const animationStateAtom = atom<AnimationState>({
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
});

export const rideableStateAtom = atom<
  Record<
    string,
    {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      velocity: THREE.Vector3;
      isOccupied: boolean;
      objectType: 'vehicle' | 'airplane';
    }
  >
>({});

export const sizesStateAtom = atom<Record<string, THREE.Vector3>>({});
export const minimapAtom = atom<minimapInnerType>({
  props: {},
});

export interface ControllerConfig {
  airplane: {
    angleDelta: THREE.Vector3;
    maxAngle: THREE.Vector3;
    maxSpeed: number;
    accelRatio: number;
    brakeRatio: number;
    buoyancy: number;
    linearDamping: number;
  };
  vehicle: {
    maxSpeed: number;
    accelRatio: number;
    brakeRatio: number;
    wheelOffset: number;
    linearDamping: number;
  };
  character: {
    walkSpeed: number;
    runSpeed: number;
    turnSpeed: number;
    jumpSpeed: number;
    linearDamping: number;
    jumpGravityScale: number;
    normalGravityScale: number;
    airDamping: number;
    stopDamping: number;
  };
  controllerOptions: {
    lerp: {
      cameraTurn: number;
      cameraPosition: number;
    };
  };
}

export const controllerConfigAtom = atom<ControllerConfig>({
  airplane: {
    angleDelta: vec3({
      x: Math.PI / 256,
      y: Math.PI / 256,
      z: Math.PI / 256,
    }),
    maxAngle: vec3({
      x: Math.PI / 8,
      y: Math.PI / 8,
      z: Math.PI / 8,
    }),
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
  controllerOptions: {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  },
});

export const currentControllerConfigAtom = atom((get) => {
  const mode = get(modeStateAtom);
  const config = get(controllerConfigAtom);

  switch (mode.type) {
    case 'airplane':
      return config.airplane;
    case 'vehicle':
      return config.vehicle;
    case 'character':
      return config.character;
    default:
      return config.character;
  }
});

// 현재 애니메이션 상태
export const currentAnimationAtom = atom((get) => {
  const mode = get(modeStateAtom);
  const animations = get(animationStateAtom);

  return animations[mode.type];
});

// 이동 관련 상태 (기존 movementStateAtom과 통합)
export const physicsMovementAtom = atom((get) => {
  const input = get(inputAtom);
  const gameStates = get(gameStatesAtom);

  return {
    ...get(movementStateAtom), // 기존 입력 기반 이동 상태
    isOnGround: gameStates.isOnTheGround,
    isJumping: gameStates.isJumping,
    isRiding: gameStates.isRiding,
    velocity: get(activeStateAtom).velocity,
  };
});

export type EventType =
  | 'POSITION_CHANGED'
  | 'MODE_CHANGED'
  | 'RIDEABLE_ENTER'
  | 'RIDEABLE_EXIT'
  | 'ANIMATION_CHANGE'
  | 'PHYSICS_UPDATE'
  | 'COLLISION_DETECTED';

export interface EventPayload {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: number;
}

export const eventBusAtom = atom<EventPayload[]>([]);
export const publishEventAtom = atom(null, (get, set, event: Omit<EventPayload, 'timestamp'>) => {
  const currentEvents = get(eventBusAtom);
  const newEvent: EventPayload = {
    ...event,
    timestamp: Date.now(),
  };
  const updatedEvents = [...currentEvents, newEvent].slice(-100);
  set(eventBusAtom, updatedEvents);
});

export const createEventSubscriptionAtom = (eventType: EventType) =>
  atom((get) => {
    const events = get(eventBusAtom);
    return events.filter((event) => event.type === eventType);
  });

export const urlsAtom = atom(
  (get) => get(urlsStateAtom),
  (get, set, update: Partial<UrlsState>) => {
    const current = get(urlsStateAtom);
    set(urlsStateAtom, { ...current, ...update });
  },
);

export const sizesAtom = atom(
  (get) => get(sizesStateAtom),
  (get, set, update: Partial<Record<string, THREE.Vector3>>) => {
    const current = get(sizesStateAtom);
    set(sizesStateAtom, { ...current, ...update });
  },
);
