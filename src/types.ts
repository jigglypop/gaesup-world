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
  [key: string]: boolean | undefined;
};

export type KeyboardControlState<T extends string = string> = {
  [K in T]: boolean;
};

export interface KeyboardInputState {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  shift: boolean;
  space: boolean;
  keyZ: boolean;
  keyR: boolean;
  keyF: boolean;
  keyE: boolean;
  escape: boolean;
}

export interface MouseInputState {
  target: THREE.Vector3;
  angle: number;
  isActive: boolean;
  shouldRun: boolean;
}

export interface GamepadInputState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  buttons: Record<string, boolean>;
}

export interface inputState {
  keyboard: KeyboardInputState;
  pointer: MouseInputState;
  gamepad: GamepadInputState;
  blocks: BlockState;
  clickerOption: ClickerOptionState;
}
export type ControllerType = 'character' | 'vehicle' | 'airplane';

export type CameraControlMode =
  | 'firstPerson'
  | 'thirdPerson'
  | 'chase'
  | 'topDown'
  | 'sideScroll'
  | 'shoulder'
  | 'fixed'
  | 'isometric'
  | 'free';

export type ControlMode = 'normal' | 'chase';
export type ControllerMode = 'clicker';

export type ModeType = {
  type?: ControllerType;
  controller?: ControllerMode;
  control?: CameraControlMode | ControlMode;
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

export type PassiveStateType = {
  position: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
};

// ============================================================================
// 블록 관련 타입들
// ============================================================================

export interface BlockState {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
}

// ============================================================================
// 리소스 및 크기 타입들
// ============================================================================

export type ResourceUrlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type SizeType = {
  x: number;
  y: number;
  z: number;
};

export type SizesType = {
  [key: string]: THREE.Vector3;
};

// ============================================================================
// 카메라 관련 타입들
// ============================================================================

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
  shoulderOffset?: THREE.Vector3;
  aimOffset?: THREE.Vector3;
  fixedPosition?: THREE.Vector3;
  fixedRotation?: THREE.Euler;
  lookAtTarget?: THREE.Vector3;
  isoAngle?: number;
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

export type SlopeRayType = Omit<RayType, 'parent'>;
export type GroundRayType = Omit<RayType, 'current' | 'angle'>;

// ============================================================================
// 애니메이션 관련 타입들
// ============================================================================

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

export type ActionsType = AnimationTagType & {
  [key: string]: string;
};

export type AnimationAtomType = {
  tag: string;
  condition: () => boolean;
  action?: () => void;
  animationName?: string;
  key?: string;
};

export type AnimationStatePropType = {
  current: string;
  animationNames?: ActionsType;
  keyControl?: KeyboardControlState;
  store: { [key: string]: AnimationAtomType };
  default: string;
};

export type AnimationStateType = {
  [key: string]: AnimationStatePropType;
};
export type ClickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};

export type QueueActionType = 'stop';

export type QueueFunctionType = {
  action: QueueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

export type QueueItemType = THREE.Vector3 | QueueFunctionType;
export type QueueType = QueueItemType[];

export interface ClickerOptionState {
  isRun: boolean;
  throttle: number;
  autoStart: boolean;
  track: boolean;
  loop: boolean;
  queue: THREE.Vector3[];
  line: boolean;
}

export type ClickerOptionType = ClickerOptionState;
export type WheelStateType = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

export type WheelsStateType = {
  0?: WheelStateType;
  1?: WheelStateType;
  2?: WheelStateType;
  3?: WheelStateType;
};
export type PortalType = {
  text?: string;
  position: THREE.Vector3;
  teleportStyle?: CSSProperties;
};

export type PortalsType = PortalType[];
export type RefsType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef: RefObject<THREE.Group>;
};

export interface ControllerOtherPropType extends RigidBodyProps {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
}
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
    control: CameraControlMode | 'chase' | 'normal';
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
export interface PhysicsInputRef {
  current: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  } | null;
}

export interface PhysicsBridgeInputData {
  inputSystem: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  };
  urls: ResourceUrlsType;
  block: BlockState;
  worldContext: unknown;
  controllerContext: unknown;
  dispatch: DispatchType<unknown>;
  setKeyboardInput: (update: Partial<KeyboardInputState>) => void;
  setMouseInput: (update: Partial<MouseInputState>) => void;
  getSizesByUrls: () => SizesType;
}

export interface PhysicsBridgeData {
  worldContext: unknown;
  activeState: ActiveStateType;
  input: {
    keyboard: KeyboardInputState;
    mouse: MouseInputState;
  } | null;
  urls: ResourceUrlsType;
  blockControl: boolean;
  dispatch: DispatchType<unknown>;
  setKeyboardInput: (update: Partial<KeyboardInputState>) => void;
  setMouseInput: (update: Partial<MouseInputState>) => void;
  getSizesByUrls: () => SizesType;
}

export interface PhysicsBridgeOutput {
  bridgeRef: RefObject<PhysicsBridgeData>;
  isReady: boolean;
  error: string | null;
}
export type PhysicsEventType =
  | 'POSITION_UPDATE'
  | 'ROTATION_UPDATE'
  | 'MOVE_STATE_CHANGE'
  | 'JUMP_STATE_CHANGE'
  | 'GROUND_STATE_CHANGE'
  | 'RIDE_STATE_CHANGE'
  | 'MODE_CHANGE'
  | 'CAMERA_UPDATE'
  | 'CAMERA_BLEND_START'
  | 'CAMERA_BLEND_END'
  | 'CAMERA_EFFECT';

export type PhysicsEventData = {
  POSITION_UPDATE: {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
  };
  ROTATION_UPDATE: {
    euler: THREE.Euler;
    direction: THREE.Vector3;
    dir: THREE.Vector3;
  };
  MOVE_STATE_CHANGE: Partial<GameStatesType>;
  JUMP_STATE_CHANGE: Partial<GameStatesType>;
  GROUND_STATE_CHANGE: Partial<GameStatesType>;
  RIDE_STATE_CHANGE: Partial<GameStatesType>;
  MODE_CHANGE: {
    type: ControllerType;
    control: CameraControlMode | ControlMode;
    controller?: ControllerMode;
  };
  CAMERA_UPDATE: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov?: number;
    mode?: string;
    isBlending?: boolean;
  };
  CAMERA_BLEND_START: {
    from: {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      fov: number;
      target?: THREE.Vector3;
    };
    to: {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      fov: number;
      target?: THREE.Vector3;
    };
    duration: number;
  };
  CAMERA_BLEND_END: {
    finalState: {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      fov: number;
      target?: THREE.Vector3;
    };
  };
  CAMERA_EFFECT: {
    type: 'shake' | 'zoom' | 'punch' | 'earthquake';
    config: unknown;
  };
};

export type PhysicsEventCallback<T extends PhysicsEventType> = (data: PhysicsEventData[T]) => void;
