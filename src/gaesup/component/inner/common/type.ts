import { Collider } from "@dimforge/rapier3d-compat";
import { RigidBodyProps, RigidBodyTypeString } from "@react-three/rapier";
import { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { callbackType } from "../../../controller/initialize/callback/type";
import { GroundRayType, PartsType } from "../../../controller/type";
import { ResourceUrlsType } from "../../../context";
import { innerRefType, passivePropsType } from "../../passive/type";
// collider 정의
export type characterColliderType = {
  height: number;
  halfHeight: number;
  radius: number;
  diameter: number;
};
// innerGroupRef 타입정의
export type InnerGroupRefType = {
  children?: React.ReactNode;
  objectNode: THREE.Object3D;
  animationRef: MutableRefObject<THREE.Object3D<THREE.Object3DEventMap>>;
  nodes: {
    [name: string]: THREE.Object3D<THREE.Object3DEventMap>;
  };
  isActive?: boolean;
  ridingUrl?: string;
  offset?: THREE.Vector3;
  parts?: PartsType;
} & ridingType;
// riding 타입정의
export type ridingType = {
  isRiderOn?: boolean;
  enableRiding?: boolean;
};

export type refPropsType = {
  children: React.ReactNode;
  urls: ResourceUrlsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  offset?: THREE.Vector3;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  userData?: { intangible: boolean };
  currentAnimation?: string;
  type?: RigidBodyTypeString;
};

export type setGroundRayType = {
  groundRay: GroundRayType;
  length: number;
  colliderRef: RefObject<Collider>;
};

export type rigidBodyRefType = {
  name?: string;
  userData?: { intangible: boolean };
  isActive?: boolean;
  ridingUrl?: string;
  groundRay?: GroundRayType;
  rigidBodyProps?: RigidBodyProps;
  isNotColliding?: boolean;
  parts?: PartsType;
} & passivePropsType &
  innerRefType &
  callbackType;
