import * as THREE from 'three';
import { ReactNode } from 'react';
import { KeyControlType, BlockType, RefsType, UrlsType } from '../base';
import { AnimationStateType } from '../animation';
import { ModeType } from '../controller';

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
 * 미니맵 객체 타입
 */
export type MinimapObjectType = {
  type: 'normal' | 'ground';
  text?: string;
  size: THREE.Vector3;
  center: THREE.Vector3;
};

/**
 * 클릭 큐 액션 타입
 */
export type QueueActionType = 'stop';

/**
 * 클릭 큐 함수 타입
 */
export type QueueFunctionType = {
  action: QueueActionType;
  beforeCB: (state: any) => void;
  afterCB: (state: any) => void;
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

/**
 * GaesupWorld 컴포넌트 속성 타입
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
