import { euler, quat, vec3 } from '@react-three/rapier';
import { atom } from 'jotai';
import * as THREE from 'three';
import { inputAtom, movementStateAtom } from './inputAtom';
import {
  ActiveState,
  AnimationState,
  ControllerConfig,
  EventPayload,
  EventType,
  GameStates,
  ModeState,
  UrlsState,
} from './types';

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

export const modeStateAtom = atom<ModeState>({
  type: 'character',
  controller: 'clicker',
  control: 'chase',
});

export const urlsStateAtom = atom<UrlsState>({
  characterUrl: null,
  vehicleUrl: null,
  airplaneUrl: null,
  wheelUrl: null,
  ridingUrl: null,
});

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
export const minimapAtom = atom<{ props: Record<string, any> }>({
  props: {},
});

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

export const currentAnimationAtom = atom((get) => {
  const mode = get(modeStateAtom);
  const animations = get(animationStateAtom);

  return animations[mode.type];
});

export const physicsMovementAtom = atom((get) => {
  const input = get(inputAtom);
  const gameStates = get(gameStatesAtom);

  return {
    ...get(movementStateAtom),
    isOnGround: gameStates.isOnTheGround,
    isJumping: gameStates.isJumping,
    isRiding: gameStates.isRiding,
    velocity: get(activeStateAtom).velocity,
  };
});

export const eventBusAtom = atom<EventPayload[]>([]);
export const publishEventAtom = atom(null, (get, set, event: Omit<EventPayload, 'timestamp'>) => {
  const currentEvents = get(eventBusAtom);
  const newEvent: EventPayload = {
    ...event,
    timestamp: Date.now(),
  };
  const updatedEvents = [...currentEvents, newEvent].slice(-100);
  set(eventBusAtom, updatedEvents as any);
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
    set(sizesStateAtom, { ...current, ...update } as any);
  },
);
