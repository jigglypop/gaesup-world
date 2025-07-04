import * as THREE from 'three';
import { ActiveStateType } from './types';
import { GameStatesType } from '../../world/components/Rideable/types';

export interface StateEngineRefs {
  activeState: ActiveStateType;
  gameStates: GameStatesType;
}

export class StateEngine {
  private static instance: StateEngine | null = null;
  
  private refs: StateEngineRefs = {
    activeState: {
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      angular: new THREE.Vector3(),
      isGround: false,
    },
    gameStates: {
      canRide: false,
      isRiding: false,
      isJumping: false,
      isFalling: false,
      isMoving: false,
      isRunning: false,
      isNotMoving: true,
      isNotRunning: true,
      isOnTheGround: true,
      nearbyRideable: undefined,
      currentRideable: undefined,
      rideableDistance: undefined,
    },
  };
  
  private constructor() {}
  
  static getInstance(): StateEngine {
    if (!StateEngine.instance) {
      StateEngine.instance = new StateEngine();
    }
    return StateEngine.instance;
  }
  
  getActiveStateRef(): ActiveStateType {
    return this.refs.activeState;
  }
  
  getGameStatesRef(): GameStatesType {
    return this.refs.gameStates;
  }
  
  getRefs(): StateEngineRefs {
    return this.refs;
  }
  
  updateActiveState(updates: Partial<ActiveStateType>): void {
    Object.assign(this.refs.activeState, updates);
  }
  
  updateGameStates(updates: Partial<GameStatesType>): void {
    Object.assign(this.refs.gameStates, updates);
  }
  
  resetActiveState(): void {
    this.refs.activeState.position.set(0, 0, 0);
    this.refs.activeState.quaternion.identity();
    this.refs.activeState.euler.set(0, 0, 0);
    this.refs.activeState.velocity.set(0, 0, 0);
    this.refs.activeState.direction.set(0, 0, 0);
    this.refs.activeState.dir.set(0, 0, 0);
    this.refs.activeState.angular.set(0, 0, 0);
    this.refs.activeState.isGround = false;
  }
  
  resetGameStates(): void {
    this.refs.gameStates.canRide = false;
    this.refs.gameStates.isRiding = false;
    this.refs.gameStates.isJumping = false;
    this.refs.gameStates.isFalling = false;
    this.refs.gameStates.isMoving = false;
    this.refs.gameStates.isRunning = false;
    this.refs.gameStates.isNotMoving = true;
    this.refs.gameStates.isNotRunning = true;
    this.refs.gameStates.isOnTheGround = true;
    this.refs.gameStates.nearbyRideable = undefined;
    this.refs.gameStates.currentRideable = undefined;
    this.refs.gameStates.rideableDistance = undefined;
  }
  
  dispose(): void {
    this.resetActiveState();
    this.resetGameStates();
    StateEngine.instance = null;
  }
} 