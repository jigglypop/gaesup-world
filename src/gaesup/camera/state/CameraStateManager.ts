import * as THREE from 'three';
import { BlendFunction, CameraBlendManager } from '../blend/CameraBlendManager';
import { CameraState, CameraTransition } from './types';

export class CameraStateManager {
  private states: Map<string, CameraState> = new Map();
  private transitions: CameraTransition[] = [];
  private currentState: string = 'default';
  private stateHistory: string[] = [];
  private maxHistorySize = 10;
  private blendManager: CameraBlendManager;

  constructor(blendManager: CameraBlendManager) {
    this.blendManager = blendManager;
    this.registerDefaultStates();
  }

  private registerDefaultStates(): void {
    this.registerState({
      name: 'default',
      type: 'thirdPerson',
      position: new THREE.Vector3(-10, 10, -10),
      rotation: new THREE.Euler(0, 0, 0),
      fov: 75,
      config: {},
      priority: 0,
      tags: ['gameplay'],
    });

    this.registerState({
      name: 'combat',
      type: 'shoulder',
      position: new THREE.Vector3(-2, 2, -5),
      rotation: new THREE.Euler(0, 0, 0),
      fov: 60,
      config: { shoulderOffset: new THREE.Vector3(1, 1.6, -3) },
      priority: 10,
      tags: ['combat', 'action'],
    });

    this.registerState({
      name: 'dialogue',
      type: 'fixed',
      position: new THREE.Vector3(0, 2, 5),
      rotation: new THREE.Euler(0, Math.PI, 0),
      fov: 50,
      config: {},
      priority: 20,
      tags: ['cutscene', 'dialogue'],
    });
  }

  registerState(state: CameraState): void {
    this.states.set(state.name, state);
  }

  registerTransition(transition: CameraTransition): void {
    this.transitions.push(transition);
  }

  setState(stateName: string, immediate: boolean = false): CameraState | null {
    if (!this.states.has(stateName)) {
      console.warn(`Camera state '${stateName}' not found`);
      return null;
    }

    const newState = this.states.get(stateName)!;
    const oldState = this.states.get(this.currentState);

    this.stateHistory.push(this.currentState);
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    this.currentState = stateName;

    if (immediate || !oldState) {
      return newState;
    } else {
      const transition = this.findTransition(oldState.name, newState.name);
      const duration = transition?.duration || 1.0;
      const blendFunc = transition?.blendFunction || BlendFunction.EaseInOut;

      this.blendManager.startBlend(
        {
          position: oldState.position,
          rotation: oldState.rotation,
          fov: oldState.fov,
          target: oldState.target,
        },
        {
          position: newState.position,
          rotation: newState.rotation,
          fov: newState.fov,
          target: newState.target,
        },
        duration,
        blendFunc,
      );
    }

    return newState;
  }

  private findTransition(from: string, to: string): CameraTransition | null {
    return this.transitions.find((t) => t.from === from && t.to === to) || null;
  }

  checkAutoTransitions(): void {
    for (const transition of this.transitions) {
      if (transition.from === this.currentState && transition.condition()) {
        this.setState(transition.to);
        break;
      }
    }
  }

  getCurrentState(): CameraState | undefined {
    return this.states.get(this.currentState);
  }

  getPreviousState(): string | undefined {
    return this.stateHistory[this.stateHistory.length - 1];
  }

  revertToPrevious(): void {
    const previous = this.getPreviousState();
    if (previous) {
      this.setState(previous);
    }
  }

  saveSnapshot(name: string): void {
    const current = this.getCurrentState();
    if (current) {
      localStorage.setItem(
        `camera_snapshot_${name}`,
        JSON.stringify({
          state: current,
          timestamp: Date.now(),
        }),
      );
    }
  }

  loadSnapshot(name: string): void {
    const data = localStorage.getItem(`camera_snapshot_${name}`);
    if (data) {
      const snapshot = JSON.parse(data);
      this.registerState(snapshot.state);
      this.setState(snapshot.state.name);
    }
  }

  getHighestPriorityState(tags: string[]): CameraState | null {
    let highest: CameraState | null = null;
    let maxPriority = -1;

    for (const state of this.states.values()) {
      const hasTag = tags.some((tag) => state.tags.includes(tag));
      if (hasTag && state.priority > maxPriority) {
        highest = state;
        maxPriority = state.priority;
      }
    }

    return highest;
  }
}
