import { euler, quat, vec3 } from '@react-three/rapier';
import { atom } from 'jotai';
import * as THREE from 'three';
import { V3 } from '../utils/vector';

// ============================================================================
// 🎯 핵심 상태 Atoms (Context 대체)
// ============================================================================

// 액티브 상태 (위치, 회전, 속도 등)
export interface ActiveState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  dir: THREE.Vector3;
  direction: THREE.Vector3;
}

export const activeStateAtom = atom<ActiveState>({
  position: V3(0, 5, 5),
  velocity: vec3(),
  quat: quat(),
  euler: euler(),
  dir: vec3(),
  direction: vec3(),
});

// 모드 상태 (컨트롤러 타입, 조작 방식 등)
export interface ModeState {
  type: 'character' | 'vehicle' | 'airplane';
  controller: 'clicker' | 'keyboard' | 'joystick' | 'gamepad';
  control: 'thirdPersonOrbit' | 'firstPerson' | 'topDown';
}

export const modeStateAtom = atom<ModeState>({
  type: 'character',
  controller: 'clicker',
  control: 'thirdPersonOrbit',
});

// URL 리소스 상태
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

// 게임 상태 (이동, 점프, 라이딩 등)
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
  nearbyRideable: any;
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

// 애니메이션 상태
export interface AnimationState {
  character: {
    current: string;
    default: string;
    store: Record<string, any>;
  };
  vehicle: {
    current: string;
    default: string;
    store: Record<string, any>;
  };
  airplane: {
    current: string;
    default: string;
    store: Record<string, any>;
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

// 라이더블 상태
export const rideableStateAtom = atom<Record<string, any>>({});

// 사이즈 상태
export const sizesStateAtom = atom<Record<string, any>>({});

// ============================================================================
// 🎮 컨트롤러 설정 Atoms
// ============================================================================

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
  controllerOptions: {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1,
    },
  },
});

// ============================================================================
// 🔄 파생 상태 Atoms (계산된 값들)
// ============================================================================

// 현재 타입에 맞는 컨트롤러 설정
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
  const input = get(unifiedInputAtom);
  const gameStates = get(gameStatesAtom);

  return {
    ...get(movementStateAtom), // 기존 입력 기반 이동 상태
    // 물리 기반 추가 상태
    isOnGround: gameStates.isOnTheGround,
    isJumping: gameStates.isJumping,
    isRiding: gameStates.isRiding,
    velocity: get(activeStateAtom).velocity,
  };
});

// ============================================================================
// 🚌 이벤트 버스 (Context 대신 사용)
// ============================================================================

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
  data: any;
  timestamp: number;
}

// 이벤트 버스 Atom
export const eventBusAtom = atom<EventPayload[]>([]);

// 이벤트 발행 함수
export const publishEventAtom = atom(null, (get, set, event: Omit<EventPayload, 'timestamp'>) => {
  const currentEvents = get(eventBusAtom);
  const newEvent: EventPayload = {
    ...event,
    timestamp: Date.now(),
  };

  // 최근 100개 이벤트만 유지 (메모리 관리)
  const updatedEvents = [...currentEvents, newEvent].slice(-100);
  set(eventBusAtom, updatedEvents);
});

// 특정 타입 이벤트 구독
export const createEventSubscriptionAtom = (eventType: EventType) =>
  atom((get) => {
    const events = get(eventBusAtom);
    return events.filter((event) => event.type === eventType);
  });

// ============================================================================
// 🔗 하위 호환성 Export
// ============================================================================

// 기존 unifiedInputAtom import
import { movementStateAtom, unifiedInputAtom } from './unifiedInputAtom';
