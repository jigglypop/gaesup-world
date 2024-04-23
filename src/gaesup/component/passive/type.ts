import { Collider } from "@dimforge/rapier3d-compat";
import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBodyTypeString,
} from "@react-three/rapier";
import { MutableRefObject } from "react";
import * as THREE from "three";
import { controllerOptionsType } from "../../controller/type";
import { ridingType } from "../inner/common/type";

// 컴포넌트 종류
export type componentTypeString = "character" | "vehicle" | "airplane";
// 내부 컴포넌트 종류
export type innerRefType = {
  colliderRef: MutableRefObject<Collider>;
  rigidBodyRef: MutableRefObject<RapierRigidBody>;
  outerGroupRef: MutableRefObject<THREE.Group>;
  innerGroupRef: MutableRefObject<THREE.Group>;
};
// passive 오브젝트 타입정의
export type passivePropsType = {
  children?: React.ReactNode;
  url: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  controllerOptions?: controllerOptionsType;
  currentAnimation?: string;
  rigidbodyType?: RigidBodyTypeString;
  onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
  componentType: componentTypeString;
  userData?: {
    intangible: boolean;
  };
} & ridingType;
