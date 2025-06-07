import { ridingType, rigidBodyRefType } from '../common/types';
import { RefObject } from 'react';
import { RapierRigidBody } from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

// vehicle 타입 정의
export type vehicleUrlType = {
  wheelUrl?: string;
};

export type vehicleInnerType = rigidBodyRefType & ridingType & vehicleUrlType;

export type WheelJointProps = {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: [number, number, number];
  wheelAnchor: [number, number, number];
  rotationAxis: [number, number, number];
};

export type WheelsRefProps = {
  vehicleSize: THREE.Vector3;
  rigidBodyRef: RefObject<RapierRigidBody>;
  wheelUrl: string;
};

export type VehicleWheelColliderProps = {
  wheelUrl: string;
  vehicleSize: THREE.Vector3;
};

export type VehicleColliderProps = {
  vehicleSize: THREE.Vector3;
};
