import * as THREE from 'three';

export type PhysicsEventType =
  | 'MOVE_STATE_CHANGE'
  | 'JUMP_STATE_CHANGE'
  | 'GROUND_STATE_CHANGE'
  | 'POSITION_UPDATE'
  | 'ROTATION_UPDATE'
  | 'RIDE_STATE_CHANGE'
  | 'MODE_CHANGE'
  | 'CAMERA_UPDATE';

export interface PhysicsEventData {
  MOVE_STATE_CHANGE: {
    isMoving: boolean;
    isRunning: boolean;
    isNotMoving: boolean;
    isNotRunning: boolean;
  };
  JUMP_STATE_CHANGE: {
    isJumping: boolean;
    isOnTheGround: boolean;
  };
  GROUND_STATE_CHANGE: {
    isOnTheGround: boolean;
    isFalling: boolean;
  };
  POSITION_UPDATE: {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
  };
  ROTATION_UPDATE: {
    euler: THREE.Euler;
    direction: THREE.Vector3;
    dir: THREE.Vector3;
  };
  RIDE_STATE_CHANGE: {
    isRiding: boolean;
    canRide: boolean;
    shouldEnterRideable: boolean;
    shouldExitRideable: boolean;
  };
  MODE_CHANGE: {
    type: string;
    control: string;
    controller: string;
  };
  CAMERA_UPDATE: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    focus?: boolean;
  };
}

export type PhysicsEvent =
  | { type: 'PLAYER_MOVE'; moving: boolean; running: boolean }
  | { type: 'PLAYER_JUMP'; jumping: boolean; onGround: boolean }
  | { type: 'PLAYER_GROUND'; onGround: boolean; falling: boolean }
  | { type: 'PLAYER_POSITION'; position: THREE.Vector3; velocity: THREE.Vector3 }
  | { type: 'PLAYER_ROTATION'; euler: THREE.Euler; direction: THREE.Vector3 }
  | { type: 'PLAYER_RIDE'; riding: boolean; canRide: boolean };
