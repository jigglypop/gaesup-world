import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { MotionSystem } from '@/core/motions/core/system/MotionSystem';
import { MotionType } from '@/core/motions/core/system/types';

export type MotionEntity = {
  system: MotionSystem;
  rigidBody: RapierRigidBody;
  type: MotionType;
  dispose: () => void;
}

export type MotionCommandType = 'move' | 'jump' | 'stop' | 'turn' | 'setConfig' | 'reset';

export type MotionCommandData = {
  movement?: THREE.Vector3;
  direction?: number;
  force?: THREE.Vector3;
  config?: MotionConfig;
};

export type MotionCommand = {
  type: MotionCommandType;
  data?: MotionCommandData;
};

export type MotionConfig = {
  maxSpeed: number;
  acceleration: number;
  jumpForce: number;
  damping?: number;
  rotationSpeed?: number;
};

export type MotionMetricsSnapshot = {
  currentSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  frameTime: number;
  isAccelerating: boolean;
};

export type MotionSnapshot = {
  type: MotionType;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  metrics: MotionMetricsSnapshot;
  config: MotionConfig;
};

export type MotionBridgeInterface = {
  registerEntity(id: string, type: MotionType, rigidBody: RapierRigidBody): void;
  unregisterEntity(id: string): void;
  execute(entityId: string, command: MotionCommand): void;
  updateEntity(entityId: string, deltaTime: number): void;
  snapshot(entityId: string): MotionSnapshot | null;
  subscribe(listener: (snapshot: MotionSnapshot) => void): () => void;
  dispose(): void;
};

export type MotionEvents = {
  onMotionStart: (entityId: string, type: MotionType) => void;
  onMotionStop: (entityId: string) => void;
  onGroundContact: (entityId: string, isGrounded: boolean) => void;
  onSpeedChange: (entityId: string, speed: number) => void;
};
