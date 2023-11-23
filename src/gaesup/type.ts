import { Collider, Ray, RayColliderToi } from '@dimforge/rapier3d-compat';
import {
  GroupProps,
  OrthographicCameraProps,
  RootState
} from '@react-three/fiber';
import { RapierRigidBody, RigidBodyProps } from '@react-three/rapier';
import { ReactNode, RefObject } from 'react';
import * as THREE from 'three';
import { animationPropType } from './stores/animation';
import { statesType } from './stores/states';

export type cameraRayType = {
  origin: THREE.Vector3;
  hit: THREE.Raycaster;
  rayCast: THREE.Raycaster | null;
  lerpingPoint: THREE.Vector3;
  length: number;
  dir: THREE.Vector3;
  position: THREE.Vector3;
  followCamera: THREE.Object3D;
  pivot: THREE.Object3D;
  intersetesAndTransParented: THREE.Intersection<
    THREE.Object3D<THREE.Object3DEventMap>
  >[];
  intersects: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[];
  intersectObjects: THREE.Object3D[];
  intersectObjectMap: { [uuid: string]: THREE.Object3D };
};

export type currentType = {
  position: THREE.Vector3;
  standPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  reverseVelocity: THREE.Vector3;
  quat: THREE.Quaternion;
  euler: THREE.Euler;
  direction: THREE.Vector3;
  dir: THREE.Vector3;
  refs: {
    capsuleColliderRef?: RefObject<Collider>;
    rigidBodyRef?: RefObject<RapierRigidBody>;
    outerGroupRef?: RefObject<THREE.Group>;
    slopeRayOriginRef?: RefObject<THREE.Mesh>;
  };
};

export type moveType = {
  impulse: THREE.Vector3;
  direction: THREE.Vector3;
  accelation: THREE.Vector3;
  velocity: THREE.Vector3;
  dragForce: THREE.Vector3;
  mass: THREE.Vector3;
  dragDamping: THREE.Vector3;
};

export type dampingType = {
  reconsil: number;
  rotational: number;
  vertical: number;
  air: number;
  dragDamping: THREE.Vector3;
  springConstant: number;
};

export type constantType = {
  jumpSpeed: number;
  jumpAccelY: number;
  turnSpeed: number;
  rejectSpeed: number;
  splintSpeed: number;
  runRate: number;
  dT: number;
  reconsil: number;
  rotational: number;
  vertical: number;
  airDamping: number;
  springConstant: number;
  cameraInitDistance: number;
  cameraMaxDistance: number;
  cameraMinDistance: number;
  cameraInitDirection: number;
  cameraCollisionOff: number;
  cameraDistance: number;
  cameraCamFollow: number;
};

export type optionsType = {
  debug: boolean;
  mode: 'normal' | 'vehicle' | 'airplane';
  controllerType: 'none' | 'gameboy' | 'joystick' | 'keyboard';
  cameraCollisionType: 'transparent' | 'closeUp';
  camera: {
    type: 'perspective' | 'orthographic';
    control: 'orbit' | 'normal';
  };
  perspectiveCamera: {
    isFront: boolean;
    XZDistance: number;
    YDistance: number;
  };
  orthographicCamera?: OrthographicCameraProps;
  minimap: boolean;
  minimapRatio: number;
};

export type partialOptionsType = Partial<optionsType>;
export type partialConstantType = Partial<constantType>;

export type jumpInnerType = {
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
};

export type jumpConstType = {
  speed: number;
  gravity: number;
};

export type jumpPropType = jumpInnerType & jumpConstType;

export type slopeRayType = {
  current: THREE.Vector3;
  origin: THREE.Vector3;
  hit: RayColliderToi | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  angle: number;
};

export type groundRayType = {
  origin: THREE.Vector3;
  hit: RayColliderToi | null;
  parent?: RapierRigidBody | null | undefined;
  rayCast: Ray | null;
  offset: THREE.Vector3;
  dir: THREE.Vector3;
  length: number;
};

export type propType = {
  options: optionsType;
  slopeRay: slopeRayType;
  groundRay: groundRayType;
  cameraRay: cameraRayType;
  jump: jumpInnerType;
  move: moveType;
  constant: constantType;
  capsuleColliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  slopeRayOriginRef: RefObject<THREE.Mesh>;
  keyControl: {
    [key: string]: boolean;
  };
};

export type animationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
};

export type actionsType = animationTagType & {
  [key: string]: string;
};

export type onFramePropType = callbackPropType & RootState;
export type onAnimatePropType = onFramePropType & {
  actions: {
    [x: string]: THREE.AnimationAction | null;
  };
  animation: animationPropType;
  playAnimation: (tag: keyof actionsType) => void;
};

export interface controllerPropType extends RigidBodyProps {
  children?: ReactNode;
  debug?: boolean;
  slopeRay?: slopeRayType;
  props?: RigidBodyProps;
  constant?: partialConstantType;
  options?: partialOptionsType;
  character?: GroupProps;
}

export type callbackPropType = {
  current: currentType;
  states: statesType;
  options: optionsType;
  slopeRay: slopeRayType;
  groundRay: groundRayType;
  cameraRay: cameraRayType;
  jump: jumpInnerType;
  move: moveType;
  constant: constantType;
  keyControl: {
    [key: string]: boolean;
  };
};

export type callbackType = {
  onReady?: (prop: callbackPropType) => void;
  onFrame?: (prop: onFramePropType) => void;
  onDestory?: (prop: callbackPropType) => void;
  onAnimate?: (prop: onAnimatePropType) => void;
};

export type refsType = {
  capsuleColliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  slopeRayOriginRef: RefObject<THREE.Mesh>;
};

export type controllerType = controllerPropType & {
  url: string;
  wheelsUrl?: string;
} & callbackType;
