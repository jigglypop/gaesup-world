import { Collider, Ray, RayColliderHit } from '@dimforge/rapier3d-compat';
import { GroupProps, RootState } from '@react-three/fiber';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { CSSProperties, Dispatch, ReactNode, RefObject } from 'react';
import * as THREE from 'three';

export type DispatchAction<T> = {
  type: string;
  payload?: Partial<T>;
};

export type DispatchType<T> = Dispatch<DispatchAction<T>>;
export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};
export type EulerLike = {
  x: number;
  y: number;
  z: number;
  order?: string;
};

export type QuaternionLike = {
  x: number;
  y: number;
  z: number;
  w: number;
};
export type ControlState = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  shift?: boolean;
  space?: boolean;
  [key: string]: boolean;
};

export type KeyboardControlState<T extends string = string> = {
  [K in T]: boolean;
};

export type ControllerType = 'character' | 'vehicle' | 'airplane';
export type CameraControlMode =
  | 'firstPerson' // 1인칭 시점
  | 'thirdPerson' // 3인칭 고정 시점 (기존 normal)
  | 'thirdPersonOrbit' // 3인칭 궤도 시점 (기존 orbit)
  | 'topDown' // 탑다운 시점
  | 'sideScroll' // 사이드 스크롤 시점
  | 'isometric' // 아이소메트릭 시점
  | 'free'; // 자유 시점

export type ControlMode = 'normal' | 'orbit';
export type ControllerMode = 'clicker';
export type ModeType = {
  type?: ControllerType;
  controller?: ControllerMode;
  control?: CameraControlMode | ControlMode; // 하위 호환성 유지
  isButton?: boolean;
};
export type ActiveStateType = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
};

export type GameStatesType = {
  rideableId?: string;
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
  canRide?: boolean;
  nearbyRideable?: {
    objectkey: string;
    objectType: 'vehicle' | 'airplane';
    name: string;
  } | null;
  shouldEnterRideable?: boolean;
  shouldExitRideable?: boolean;
};
export type ResourceUrlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type CameraOptionDebugType = {
  maxDistance?: number;
  distance?: number;
  xDistance?: number;
  yDistance?: number;
  zDistance?: number;
  zoom?: number;
  target?: THREE.Vector3;
  focus?: boolean;
  position?: THREE.Vector3;
  enableCollision?: boolean;
  collisionMargin?: number;
  smoothing?: {
    position: number;
    rotation: number;
    fov: number;
  };
  fov?: number;
  minFov?: number;
  maxFov?: number;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
    minZ?: number;
    maxZ?: number;
  };
};

export type CameraOptionType = {
  offset?: THREE.Vector3;
  modeSettings?: {
    [K in CameraControlMode]?: Partial<CameraOptionDebugType>;
  };
} & CameraOptionDebugType;

export type CameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  intersects: THREE.Intersection<THREE.Mesh>[];
  detected: THREE.Intersection<THREE.Mesh>[];
  intersectObjectMap: { [uuid: string]: THREE.Mesh };
};

export type RayType = {
  origin: THREE.Vector3;
  hit: RayColliderHit | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

/**
 * 경사 레이 타입
 */
export type SlopeRayType = Omit<RayType, 'parent'>;

/**
 * 지면 레이 타입
 */
export type GroundRayType = Omit<RayType, 'current' | 'angle'>;

// ============================================================================
// 애니메이션 타입들
// ============================================================================

/**
 * 애니메이션 태그 타입
 */
export type AnimationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
  ride: string;
  land: string;
  sit: string;
};

/**
 * 액션 타입
 */
export type ActionsType = AnimationTagType & {
  [key: string]: string;
};

/**
 * 애니메이션 아톰 타입
 */
export type AnimationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

/**
 * 애니메이션 상태 프로퍼티 타입
 */
export type AnimationStatePropType = {
  current: string;
  animationNames?: ActionsType;
  keyControl?: KeyboardControlState;
  store: { [key: string]: AnimationAtomType };
  default: string;
};

/**
 * 애니메이션 상태 타입
 */
export type AnimationStateType = {
  [key: string]: AnimationStatePropType;
};

// ============================================================================
// 클리커 관련 타입들
// ============================================================================

/**
 * 클리커 타입
 */
export type ClickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};

/**
 * 큐 액션 타입
 */
export type QueueActionType = 'stop';

/**
 * 큐 함수 타입
 */
export type QueueFunctionType = {
  action: QueueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

/**
 * 큐 아이템 타입
 */
export type QueueItemType = THREE.Vector3 | QueueFunctionType;

/**
 * 큐 타입
 */
export type QueueType = QueueItemType[];

/**
 * 클리커 옵션 타입
 */
export type ClickerOptionType = {
  autoStart?: boolean;
  isRun?: boolean;
  throttle?: number;
  track?: boolean;
  loop?: boolean;
  queue?: QueueType;
  line?: boolean;
};

// ============================================================================
// 블록 및 크기 타입들
// ============================================================================

/**
 * 블록 타입
 */
export type BlockType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};

/**
 * 크기 타입
 */
export type SizeType = {
  x: number;
  y: number;
  z: number;
};

/**
 * 크기들 타입
 */
export type SizesType = {
  [key: string]: THREE.Vector3;
};

// ============================================================================
// 휠 관련 타입들
// ============================================================================

/**
 * 휠 상태 타입
 */
export type WheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

/**
 * 휠들 상태 타입
 */
export type WheelsStateType = {
  0?: WheelStateType;
  1?: WheelStateType;
  2?: WheelStateType;
  3?: WheelStateType;
};

// ============================================================================
// 패시브 상태 타입
// ============================================================================

/**
 * 패시브 상태 타입
 */
export type PassiveStateType = {
  position: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
};

// ============================================================================
// 포털 타입들
// ============================================================================

/**
 * 포털 타입
 */
export type PortalType = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};

/**
 * 포털들 타입
 */
export type PortalsType = PortalType[];

// ============================================================================
// 참조 타입들
// ============================================================================

/**
 * 참조 타입
 */
export type RefsType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef: RefObject<THREE.Group>;
};

// ============================================================================
// 컨트롤러 옵션 타입들
// ============================================================================

/**
 * 컨트롤러 옵션 타입
 */
export type ControllerOptionsType = {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
};

export type OptionsType = {
  debug: boolean;
  mode?: 'normal' | 'vehicle' | 'airplane';
  controllerType: 'none';
  cameraCollisionType: 'transparent' | 'closeUp';
  camera: {
    type: 'perspective' | 'orthographic';
    control: CameraControlMode | 'orbit' | 'normal';
  };
  minimap: boolean;
  minimapRatio: number;
};
export type PartialOptionsType = Partial<OptionsType>;
export type JumpInnerType = {
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
};

export type JumpConstType = {
  speed: number;
  gravity: number;
};

export type JumpPropType = JumpInnerType & JumpConstType;
export type PartType = {
  url?: string;
  color?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
};

export type PartsType = PartType[];
export interface ControllerOtherPropType extends RigidBodyProps {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
}
export type dispatchType<T> = DispatchType<T>;
export type controlType = ControlState;
export type keyControlType = KeyboardControlState;
export type modeType = ModeType;
export type activeStateType = ActiveStateType;
export type statesType = GameStatesType;
export type urlsType = ResourceUrlsType;
export type cameraOptionType = CameraOptionType;
export type gaesupCameraOptionDebugType = CameraOptionDebugType;
export type cameraRayType = CameraRayType;
export type rayType = RayType;
export type slopeRayType = SlopeRayType;
export type groundRayType = GroundRayType;
export type animationTagType = AnimationTagType;
export type actionsType = ActionsType;
export type animationAtomType = AnimationAtomType;
export type animationStatePropType = AnimationStatePropType;
export type animationStateType = AnimationStateType;
export type clickerType = ClickerType;
export type queueActionType = QueueActionType;
export type queueFunctionType = QueueFunctionType;
export type queueItemType = QueueItemType;
export type queueType = QueueType;
export type clickerOptionType = ClickerOptionType;
export type blockType = BlockType;
export type sizeType = SizeType;
export type sizesType = SizesType;
export type wheelStateType = WheelStateType;
export type wheelsStateType = WheelsStateType;
export type passiveStateType = PassiveStateType;
export type portalType = PortalType;
export type portalsType = PortalsType;
export type refsType = RefsType;
export type controllerOptionsType = ControllerOptionsType;
export type optionsType = OptionsType;
export type partialOptionsType = PartialOptionsType;
export type jumpInnerType = JumpInnerType;
export type jumpConstType = JumpConstType;
export type jumpPropType = JumpPropType;
export type partType = PartType;
export type partsType = PartsType;
export type controllerOtherPropType = ControllerOtherPropType;
