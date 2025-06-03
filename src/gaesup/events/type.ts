import * as THREE from 'three';
import { PhysicsState } from '../physics/type';

export type EventType =
  | 'playerMoveStart'
  | 'playerMoveStop'
  | 'playerJumpStart'
  | 'playerJumpEnd'
  | 'playerLanded'
  | 'playerFalling'
  | 'playerRunningStart'
  | 'playerRunningStop'
  | 'playerGroundTouch'
  | 'playerGroundLeave'
  | 'playerRideStart'
  | 'playerRideEnd'
  | 'npcStateChange'
  | 'uiToggle'
  | 'globalKeyEvent'
  | 'activeStateUpdate'
  | 'physicsFrameStart'
  | 'physicsFrameEnd';

export interface EventPayload {
  playerMoveStart: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerMoveStop: { position: THREE.Vector3 };
  playerJumpStart: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerJumpEnd: { position: THREE.Vector3 };
  playerLanded: { position: THREE.Vector3; impact: number };
  playerFalling: { position: THREE.Vector3; velocity: THREE.Vector3 };
  playerRunningStart: { position: THREE.Vector3 };
  playerRunningStop: { position: THREE.Vector3 };
  playerGroundTouch: { position: THREE.Vector3; normal: THREE.Vector3 };
  playerGroundLeave: { position: THREE.Vector3; lastGroundY: number };
  playerRideStart: { rideableId: string; position: THREE.Vector3 };
  playerRideEnd: { rideableId: string; position: THREE.Vector3 };
  npcStateChange: { npcId: string; state: string; data: unknown };
  uiToggle: { uiType: string; isOpen: boolean };
  globalKeyEvent: { key: string; action: 'down' | 'up' | 'pressed' };
  activeStateUpdate: { activeState: any };
  physicsFrameStart: { state: any; delta: number; physicsState: PhysicsState; timestamp: number };
  physicsFrameEnd: { state: any; delta: number; physicsState: PhysicsState; timestamp: number };
}

export type EventCallback<T extends EventType> = (payload: EventPayload[T]) => void;
export type AnyEventCallback = (payload: unknown) => void;
