import {
  Collider,
  Ray,
  RayColliderToi,
  RevoluteImpulseJoint,
} from "@dimforge/rapier3d-compat";
import { GroupProps, OrthographicCameraProps } from "@react-three/fiber";
import { RapierRigidBody, RigidBodyProps } from "@react-three/rapier";
import { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { cameraRayType } from "../camera/type.js";
import { callbackType } from "../initial/callback/type.js";
import { keyControlType } from "../world/context/type.js";
import {
  airplaneType,
  cameraOptionType,
  characterType,
  gaesupCameraPropType,
  perspectiveCameraPropType,
  vehicleType,
} from "./context/type.js";

export type constantType = {
  jumpSpeed: number;
  turnSpeed: number;
  walkSpeed: number;
  runSpeed: number;
  accelRate: number;
  brakeRate: number;
  wheelOffset: number;
  linearDamping: number;
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
  mode?: "normal" | "vehicle" | "airplane";
  controllerType: "none" | "gameboy" | "joystick" | "keyboard";
  cameraCollisionType: "transparent" | "closeUp";
  camera: {
    type: "perspective" | "orthographic";
    control: "orbit" | "normal";
  };
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

export type rayType = {
  origin: THREE.Vector3;
  hit: RayColliderToi | null;
  rayCast: Ray | null;
  dir: THREE.Vector3;
  offset: THREE.Vector3;
  length: number;
  current?: THREE.Vector3;
  angle?: number;
  parent?: RapierRigidBody | null | undefined;
};

export type slopeRayType = Omit<rayType, "parent">;
export type groundRayType = Omit<rayType, "current" | "angle">;

export type propType = {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
  isRider?: boolean;
  constant: constantType;

  slopeRay: slopeRayType;
  groundRay: groundRayType;
  cameraRay: cameraRayType;

  capsuleColliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  slopeRayOriginRef: RefObject<THREE.Mesh>;
  jointRefs?: RefObject<RevoluteImpulseJoint>;

  keyControl: keyControlType;
  callbacks?: callbackType;
};

export type animationTagType = {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  jumpIdle: string;
  jumpLand: string;
  fall: string;
  ride: string;
};

export type actionsType = animationTagType & {
  [key: string]: string;
};

export type refsType = {
  capsuleColliderRef: RefObject<Collider>;
  rigidBodyRef: RefObject<RapierRigidBody>;
  outerGroupRef: RefObject<THREE.Group>;
  innerGroupRef: RefObject<THREE.Group>;
  slopeRayOriginRef: RefObject<THREE.Mesh>;
  characterInnerRef: RefObject<THREE.Group>;
  jointRefs: RefObject<RevoluteImpulseJoint>;
};

// context로 넘어가는 타입
export type gaesupControllerContextPropType = {
  cameraMode: gaesupCameraPropType;
  cameraOption: cameraOptionType;
  perspectiveCamera: perspectiveCameraPropType;
  orthographicCamera: OrthographicCameraProps;
  airplane: airplaneType;
  vehicle: vehicleType;
  character: characterType;
  isRider: boolean;
};

// 나머지 controller 타입
export interface controllerOtherPropType extends RigidBodyProps {
  children?: ReactNode;
  groupProps?: GroupProps;
  rigidBodyProps?: RigidBodyProps;
  debug?: boolean;
  constant?: partialConstantType;
}

// controller 타입
export type controllerType = controllerOtherPropType &
  Partial<gaesupControllerContextPropType> &
  callbackType;
