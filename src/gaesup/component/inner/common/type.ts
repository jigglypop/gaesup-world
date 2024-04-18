import { Collider } from "@dimforge/rapier3d-compat";
import {
  CollisionEnterPayload,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { groundRayType, refsType } from "../../../controller/type";
import { propInnerType } from "../../../physics/type";
import { urlsType } from "../../../world/context/type";

export type refPropsType = {
  children: React.ReactNode;
  refs: Partial<refsType>;
  urls: urlsType;
  isRiderOn?: boolean;
  enableRiding?: boolean;
  offset?: THREE.Vector3;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  userData?: { intangible: boolean };
  currentAnimation?: string;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  type?: RigidBodyTypeString;
};

export type setGroundRayType = {
  groundRay: groundRayType;
  length: number;
  colliderRef: RefObject<Collider>;
};

export type rigidBodyRefType = {
  children: ReactNode;
  name?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  userData?: { intangible: boolean };
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  positionLerp?: number;
  type?: RigidBodyTypeString;
  url: string;
  isActive?: boolean;
  currentAnimation?: string;
  componentType: "character" | "vehicle" | "airplane";
} & propInnerType;

export type InnerGroupRefType = {
  children?: React.ReactNode;
  type: "character" | "vehicle" | "airplane";
  currentAnimation: string;
  url: string;
  rotation?: THREE.Euler;
};
