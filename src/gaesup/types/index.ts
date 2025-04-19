import * as THREE from 'three';
import { ReactNode, Dispatch, RefObject } from 'react';
import { RootState, GroupProps, ObjectMap } from '@react-three/fiber';
import { Collider, Ray } from '@dimforge/rapier3d-compat';
import {
  RapierRigidBody,
  RigidBodyProps,
  RigidBodyTypeString,
  CollisionEnterPayload,
} from '@react-three/rapier';
import { GLTF } from 'three-stdlib';
import { AnimationAction, AnimationClip, AnimationMixer } from 'three';

// ===== 기본 타입 정의 =====

/**
 * 디스패치 유틸리티 타입
 */
export type DispatchType<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

/**
 * 컴포넌트 타입 문자열
 */
export type ComponentTypeString = 'character' | 'vehicle' | 'airplane';

/**
 * GLTF 결과 타입
 */
export type GLTFResultType = GLTF & {
  nodes: { [name: string]: THREE.Mesh | THREE.SkinnedMesh };
  materials: { [name: string]: THREE.Material | THREE.MeshStandardMaterial };
} & ObjectMap;

/**
 * 참조 객체 모음 타입
 */
export type RefsType = {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef?: RefObject<THREE.Group>;
  passiveRigidBodyRef?: RefObject<RapierRigidBody>;
};

// ===== 레이 관련 타입 =====

/**
 * 기본 레이 타입
 */
export type RayType = {
  origin: THREE.Vector3;
  hit: any | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

/**
 * 지면 감지용 레이
 */
export type GroundRayType = Omit<RayType, 'current' | 'angle'>;

/**
 * 카메라 충돌 감지용 레이
 */
export type CameraRayType = {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  length: number;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  intersects: THREE.Intersection<THREE.Object3D>[];
  detected: THREE.Intersection<THREE.Object3D>[];
  intersectObjectMap: Map<string, THREE.Mesh>;
  lastRaycastTime: number;
  raycastInterval: number;
};

// ===== 애니메이션 관련 타입 =====

/**
 * 애니메이션 API 타입
 */
export type AnimationApiType<T extends AnimationClip> = {
  ref: React.MutableRefObject<THREE.Object3D | undefined | null>;
  clips: AnimationClip[];
  mixer: AnimationMixer;
  names: T['name'][];
  actions: {
    [key in T['name']]: AnimationAction | null;
  };
};

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
  [key: string]: string;
};

/**
 * 액션 타입 (AnimationTagType의 확장)
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
 * 애니메이션 상태 속성
 */
export type AnimationStatePropType = {
  current: string;
  default: string;
  store: Record<
    string,
    {
      condition: () => boolean;
      action?: () => void;
      animationName?: string;
      key?: string;
    }
  >;
};

/**
 * 애니메이션 상태 타입
 */
export type AnimationStateType = {
  [key in ComponentTypeString]?: AnimationStatePropType;
};

// ===== 컨트롤러/모드 관련 타입 =====

/**
 * 컨트롤러 옵션 타입
 */
export type ControllerOptionsType = {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
};

/**
 * 키 컨트롤 타입
 */
export type KeyControlType = Record<string, boolean>;

/**
 * 모드 타입
 */
export type ModeType = {
  type?: ComponentTypeString;
  controller?: 'clicker' | string;
  control?: 'normal' | 'orbit';
  isButton?: boolean;
};

// ===== 월드 상태 관련 타입 =====

/**
 * 활성 상태 타입
 */
export type ActiveStateType = {
  position: THREE.Vector3;
  impulse: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
};

/**
 * 상태 플래그 모음 타입
 */
export type StatesType = {
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
  isPush: KeyControlType;
};

/**
 * URL 모음 타입
 */
export type UrlsType = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

// ===== Clicker 관련 타입 =====

/**
 * 클릭 큐 액션 타입
 */
export type QueueActionType = 'stop';

/**
 * 클릭 큐 함수 타입
 */
export type QueueFunctionType = {
  action: QueueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
};

/**
 * 클릭 큐 아이템 타입
 */
export type QueueItemType = THREE.Vector3 | QueueFunctionType;

/**
 * 클릭 옵션 타입
 */
export type ClickerOptionType = {
  autoStart?: boolean;
  isRun?: boolean;
  throttle?: number;
  track?: boolean;
  loop?: boolean;
  queue?: QueueItemType[];
  line?: boolean;
};

/**
 * 클릭 상태 타입
 */
export type ClickerType = {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
};

/**
 * 카메라 옵션 타입
 */
export type CameraOptionType = {
  offset?: THREE.Vector3;
  maxDistance?: number;
  distance?: number;
  XDistance?: number;
  YDistance?: number;
  ZDistance?: number;
  zoom?: number;
  target: THREE.Vector3;
  position: THREE.Vector3;
  focus?: boolean;
};

/**
 * 탑승 가능 객체 타입
 */
export type RideableType = {
  objectkey: string;
  objectType?: 'vehicle' | 'airplane';
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
};

/**
 * 기능 차단 타입
 */
export type BlockType = {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
};

/**
 * 미니맵 객체 타입
 */
export type MinimapObjectType = {
  type: 'normal' | 'ground';
  text?: string;
  size: THREE.Vector3;
  center: THREE.Vector3;
};

/**
 * World 컨텍스트 타입
 */
export type GaesupWorldContextType = {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: UrlsType;
  states: StatesType;
  minimap: {
    props: Record<string, MinimapObjectType>;
  };
  control: KeyControlType;
  refs: RefsType | null;
  animationState: AnimationStateType;
  cameraOption: CameraOptionType;
  clickerOption: ClickerOptionType;
  clicker: ClickerType;
  rideable: Record<string, RideableType>;
  sizes: Record<string, THREE.Vector3>;
  block: BlockType;
};

// ===== 컨트롤러 관련 타입 =====

/**
 * 비행기 디버그 설정 타입
 */
export type AirplaneDebugType = {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
};

/**
 * 차량 디버그 설정 타입
 */
export type VehicleDebugType = {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
};

/**
 * 캐릭터 디버그 설정 타입
 */
export type CharacterDebugType = {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
};

/**
 * 비행기 타입
 */
export interface AirplaneType extends GroupProps, AirplaneDebugType {}

/**
 * 차량 타입
 */
export interface VehicleType extends GroupProps, VehicleDebugType {}

/**
 * 캐릭터 타입
 */
export interface CharacterType extends GroupProps, CharacterDebugType {}

/**
 * 컨트롤러 컨텍스트 타입
 */
export type GaesupControllerType = {
  airplane: AirplaneType;
  vehicle: VehicleType;
  character: CharacterType;
  callbacks?: CallbackType;
  refs?: RefsType;
  controllerOptions?: ControllerOptionsType;
};

// ===== 콜백/이벤트 관련 타입 =====

/**
 * 콜백 속성 타입
 */
export type CallbackPropType = {
  activeState: ActiveStateType;
  states: StatesType;
  control: KeyControlType;
  subscribe: (atom: AnimationAtomType) => void;
};

/**
 * 프레임 콜백 속성 타입
 */
export type OnFramePropType = CallbackPropType & RootState;

/**
 * 애니메이션 콜백 속성 타입
 */
export type OnAnimatePropType = OnFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animationState: AnimationStateType;
  playAnimation: (tag: keyof ActionsType, key: string) => void;
};

/**
 * 콜백 타입
 */
export type CallbackType = {
  onReady?: (prop: CallbackPropType) => void;
  onFrame?: (prop: OnFramePropType) => void;
  onDestory?: (prop: CallbackPropType) => void;
  onAnimate?: (prop: OnAnimatePropType) => void;
};

// ===== 컴포넌트 속성 타입 =====

/**
 * 파츠 타입
 */
export type PartType = {
  url?: string;
  color?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
};

/**
 * 파츠 모음 타입
 */
export type PartsType = PartType[];

/**
 * passive 컴포넌트 속성 타입
 */
export type PassivePropsType = {
  children?: ReactNode;
  groundRay?: GroundRayType;
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  controllerOptions?: ControllerOptionsType;
  currentAnimation?: string;
  rigidbodyType?: RigidBodyTypeString;
  sensor?: boolean;
  onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  componentType: ComponentTypeString;
  userData?: {
    intangible: boolean;
  };
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  parts?: PartsType;
  isNotColliding?: boolean;
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

/**
 * 물리 계산 타입
 */
export type CalcType = {
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  colliderRef: RefObject<Collider>;
  groundRay: GroundRayType;
  state?: RootState;
  delta?: number;
  worldContext: Partial<GaesupWorldContextType>;
  controllerContext: GaesupControllerType;
  dispatch?: DispatchType<GaesupWorldContextType>;
  matchSizes?: {
    [key in keyof UrlsType]?: THREE.Vector3;
  };
  // 재사용 가능한 임시 벡터 객체들 (성능 최적화용)
  tempVectors?: {
    impulse?: THREE.Vector3;
    velocity?: THREE.Vector3;
    [key: string]: THREE.Vector3;
  };
};

/**
 * 카메라 속성 타입
 */
export type CameraPropType = {
  state?: RootState;
  worldContext: Partial<GaesupWorldContextType>;
  controllerContext: GaesupControllerType;
  controllerOptions: ControllerOptionsType;
};

/**
 * 컨트롤러 타입
 */
export type ControllerType = {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
  airplane?: Partial<AirplaneType>;
  vehicle?: Partial<VehicleType>;
  character?: Partial<CharacterType>;
  controllerOptions?: ControllerOptionsType;
  parts?: PartsType;
  onReady?: CallbackType['onReady'];
  onFrame?: CallbackType['onFrame'];
  onDestory?: CallbackType['onDestory'];
  onAnimate?: CallbackType['onAnimate'];
};

/**
 * GaesupWorld 속성 타입
 */
export type GaesupWorldPropsType = {
  children: ReactNode;
  startPosition?: THREE.Vector3;
  urls?: UrlsType;
  mode?: ModeType;
  debug?: boolean;
  cameraOption?: CameraOptionType;
  block?: BlockType;
  clickerOption?: ClickerOptionType;
};

// ===== 이전 타입에 대한 별칭(타입 호환성 유지) =====

/** @deprecated 대문자 시작 이름인 DispatchType을 대신 사용하세요 */
export type dispatchType<T> = DispatchType<T>;
/** @deprecated 대문자 시작 이름인 ComponentTypeString을 대신 사용하세요 */
export type componentTypeString = ComponentTypeString;
/** @deprecated 대문자 시작 이름인 GLTFResultType을 대신 사용하세요 */
export type GLTFResult = GLTFResultType;
/** @deprecated 대문자 시작 이름인 RefsType을 대신 사용하세요 */
export type refsType = RefsType;
/** @deprecated 대문자 시작 이름인 RayType을 대신 사용하세요 */
export type rayType = RayType;
/** @deprecated 대문자 시작 이름인 GroundRayType을 대신 사용하세요 */
export type groundRayType = GroundRayType;
/** @deprecated 대문자 시작 이름인 CameraRayType을 대신 사용하세요 */
export type cameraRayType = CameraRayType;
/** @deprecated 대문자 시작 이름인 AnimationApiType을 대신 사용하세요 */
export type Api<T extends AnimationClip> = AnimationApiType<T>;
/** @deprecated 대문자 시작 이름인 AnimationTagType을 대신 사용하세요 */
export type animationTagType = AnimationTagType;
/** @deprecated 대문자 시작 이름인 ActionsType을 대신 사용하세요 */
export type actionsType = ActionsType;
/** @deprecated 대문자 시작 이름인 AnimationAtomType을 대신 사용하세요 */
export type animationAtomType = AnimationAtomType;
/** @deprecated 대문자 시작 이름인 AnimationStatePropType을 대신 사용하세요 */
export type animationStatePropType = AnimationStatePropType;
/** @deprecated 대문자 시작 이름인 AnimationStateType을 대신 사용하세요 */
export type animationStateType = AnimationStateType;
/** @deprecated 대문자 시작 이름인 ControllerOptionsType을 대신 사용하세요 */
export type controllerOptionsType = ControllerOptionsType;
/** @deprecated 대문자 시작 이름인 KeyControlType을 대신 사용하세요 */
export type keyControlType = KeyControlType;
/** @deprecated 대문자 시작 이름인 ModeType을 대신 사용하세요 */
export type modeType = ModeType;
