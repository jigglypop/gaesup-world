import * as THREE from 'three';
import { ReactNode, Dispatch, RefObject } from 'react';
import { RootState, GroupProps } from '@react-three/fiber';
import { Collider, Ray } from '@dimforge/rapier3d-compat';
import { CollisionEnterPayload, RapierRigidBody, RigidBodyProps } from '@react-three/rapier';

export type AppDispatch<T> = Dispatch<{
  type: string;
  payload?: Partial<T>;
}>;

export interface AnimationTagType {
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
}

export interface AnimationAtomType {
  tag: string; // 예) "walk" "jump"
  condition: () => boolean; // 재생 여부 판별 함수
  action?: () => void; // 실행 시 부가 액션
  animationName?: string; // 실제 AnimationClip 이름
  key?: string; // 키 입력과 연결하려면
}

export interface AnimationStatePropType {
  current: string; // 현재 재생 중인 애니메이션
  default: string; // 조건 미달 시 재생할 기본
  store: Record<
    string,
    {
      condition: () => boolean;
      action?: () => void;
      animationName?: string;
      key?: string;
    }
  >;
}
export interface AnimationStateType {
  [key: string]: AnimationStatePropType; // 예: animationState["character"]
}
export interface AnimationActions3D {
  [x: string]: THREE.AnimationAction | null;
}

export interface SubscribeActionsType {
  type: 'character' | 'vehicle' | 'airplane';
  groundRay: GroundRayType;
  animations: THREE.AnimationClip[];
}

export interface PlayActionsType {
  type: 'character' | 'vehicle' | 'airplane';
  currentAnimation?: string;
  actions: AnimationActions3D;
  animationRef: RefObject<THREE.Object3D>;
  isActive: boolean;
}

export interface GroundRayType {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  rayCast: Ray | null;
  hit: ReturnType<any> | null; // rapier world.castRay() 결과
  parent?: RapierRigidBody | null;
}

export interface CameraRayType {
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
}

export interface CameraOptionType {
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
}

export interface ControllerOptionsType {
  lerp: {
    cameraTurn: number;
    cameraPosition: number;
  };
}

export interface KeyControlType {
  [key: string]: boolean;
}

export interface ModeType {
  type?: 'character' | 'vehicle' | 'airplane';
  controller?: 'clicker';
  control?: 'normal' | 'orbit';
  isButton?: boolean;
}

export interface ActiveStateType {
  position: THREE.Vector3;
  impulse: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  rotation: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
}

export interface StatesType {
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
}

export interface UrlsType {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
}

export type QueueActionType = 'stop';

export interface QueueFunctionType {
  action: QueueActionType;
  beforeCB: (state: RootState) => void;
  afterCB: (state: RootState) => void;
  time: number;
}

export type QueueItemType = THREE.Vector3 | QueueFunctionType;

export interface ClickerOptionType {
  autoStart?: boolean;
  isRun?: boolean;
  throttle?: number;
  track?: boolean;
  loop?: boolean;
  queue?: QueueItemType[];
  line?: boolean;
}

export interface ClickerType {
  point: THREE.Vector3;
  angle: number;
  isOn: boolean;
  isRun: boolean;
}

export interface MinimapPropsType {
  type: 'normal' | 'ground';
  text?: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
  children?: ReactNode;
  position?: THREE.Vector3;
}

export interface RideableType {
  objectkey: string;
  objectType?: 'vehicle' | 'airplane';
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  wheelUrl?: string;
  ridingUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
}

export interface BlockType {
  camera: boolean;
  control: boolean;
  animation: boolean;
  scroll: boolean;
}

export interface GaesupWorldContextType {
  activeState: ActiveStateType;
  mode: ModeType;
  urls: UrlsType;
  states: StatesType;

  minimap: {
    props: Record<string, MinimapPropsType>;
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
}

export interface AirplaneDebugType {
  angleDelta?: THREE.Vector3;
  maxAngle?: THREE.Vector3;
  buoyancy?: number;
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  linearDamping?: number;
}
export interface VehicleDebugType {
  maxSpeed?: number;
  accelRatio?: number;
  brakeRatio?: number;
  wheelOffset?: number;
  linearDamping?: number;
}
export interface CharacterDebugType {
  jumpSpeed?: number;
  turnSpeed?: number;
  walkSpeed?: number;
  runSpeed?: number;
  linearDamping?: number;
}

export interface AirplaneType extends GroupProps, AirplaneDebugType {}
export interface VehicleType extends GroupProps, VehicleDebugType {}
export interface CharacterType extends GroupProps, CharacterDebugType {}

export interface GaesupControllerType {
  airplane: AirplaneType;
  vehicle: VehicleType;
  character: CharacterType;
  callbacks?: CallbackType;
  refs?: RefsType;
  controllerOptions?: ControllerOptionsType;
}

export interface CallbackPropType {
  activeState: ActiveStateType;
  states: StatesType;
  control: KeyControlType;
  subscribe: (atom: AnimationAtomType) => void;
}

export interface OnFramePropType extends CallbackPropType, RootState {}

export interface OnAnimatePropType extends OnFramePropType {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animationState: AnimationStateType;
  playAnimation: (tag: keyof AnimationTagType, key: string) => void;
}

export interface CallbackType {
  onReady?: (prop: CallbackPropType) => void;
  onFrame?: (prop: OnFramePropType) => void;
  onDestory?: (prop: CallbackPropType) => void;
  onAnimate?: (prop: OnAnimatePropType) => void;
}

export interface RefsType {
  colliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  characterInnerRef?: RefObject<THREE.Group>;
  passiveRigidBodyRef?: RefObject<RapierRigidBody>;
}

export interface PartType {
  url?: string;
  color?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export type PartsType = PartType[];

export interface PassivePropsType {
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  componentType: 'character' | 'vehicle' | 'airplane';
  currentAnimation?: string;
  rigidbodyType?: 'fixed' | 'dynamic' | 'kinematicPosition' | 'kinematicVelocity';
  sensor?: boolean;
  onIntersectionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  userData?: {
    intangible: boolean;
  };
  rigidBodyProps?: RigidBodyProps;
  outerGroupProps?: THREE.Group;
  innerGroupProps?: THREE.Group;
  controllerOptions?: ControllerOptionsType;
  children?: ReactNode;
  isNotColliding?: boolean;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  groundRay?: GroundRayType;
  parts?: PartsType;
}
