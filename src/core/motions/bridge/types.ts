import * as THREE from 'three';
import { MotionType } from '@core/motions/core/engine/types';
import { RapierRigidBody } from '@react-three/rapier';
import { MotionEngine } from '@core/motions/core/engine/MotionEngine';

export type MotionEntity = {
  engine: MotionEngine;
  rigidBody: RapierRigidBody;
  type: MotionType;
  dispose: () => void;
}


export type MotionCommand = {
  type: 'move' | 'jump' | 'stop' | 'turn' | 'setConfig' | 'reset';
  data?: {
    movement?: THREE.Vector3;
    direction?: number;
    force?: THREE.Vector3;
    config?: any;
  };
};

export type MotionSnapshot = {
  type: MotionType;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  metrics: {
    currentSpeed: number;
    averageSpeed: number;
    totalDistance: number;
    frameTime: number;
    isAccelerating: boolean;
  };
  config: {
    maxSpeed: number;
    acceleration: number;
    jumpForce: number;
  };
};

export interface MotionBridgeInterface {
  registerEntity(id: string, type: MotionType, rigidBody: any): void;
  unregisterEntity(id: string): void;
  execute(entityId: string, command: MotionCommand): void;
  updateEntity(entityId: string, deltaTime: number): void;
  snapshot(entityId: string): MotionSnapshot | null;
  subscribe(listener: (snapshot: MotionSnapshot) => void): () => void;
  dispose(): void;
}

export interface MotionEvents {
  onMotionStart: (entityId: string, type: MotionType) => void;
  onMotionStop: (entityId: string) => void;
  onGroundContact: (entityId: string, isGrounded: boolean) => void;
  onSpeedChange: (entityId: string, speed: number) => void;
}
