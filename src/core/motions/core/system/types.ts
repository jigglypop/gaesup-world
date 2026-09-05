import * as THREE from 'three';

import { BaseState, BaseMetrics, SystemOptions } from '@core/boilerplate';
import { GameStatesType } from '@core/world/components/Rideable/types';

import { ActiveStateType } from '../types';

export type MotionType = 'character' | 'vehicle' | 'airplane';

export interface MotionState extends BaseState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  direction: THREE.Vector3;
  isAccelerating?: boolean;
}

export interface MotionMetrics extends BaseMetrics {
  currentSpeed: number;
  averageSpeed: number;
  totalDistance: number;
  lastPosition: THREE.Vector3;
  isAccelerating: boolean;
  groundContact: boolean;
  physicsTime: number;
}

export interface MotionSystemOptions extends SystemOptions {
  type: MotionType;
}

export interface PhysicsSystemState extends BaseState {
  isJumping: boolean;
  isMoving: boolean;
  isRunning: boolean;
}

export interface PhysicsSystemMetrics extends BaseMetrics {
  forcesApplied: number;
  dampingChanges: number;
}

export type PhysicsSystemOptions = SystemOptions;

export interface EntityStateRefs {
  activeState: ActiveStateType;
  gameStates: GameStatesType;
}
