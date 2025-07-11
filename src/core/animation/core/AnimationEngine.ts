import * as THREE from 'three';
import {
  AnimationEngineState,
  AnimationMetrics,
  AnimationEngineCallback
} from './types';
import { Profile, HandleError, MonitorMemory, TrackCalls } from '@/core/boilerplate/decorators';

export class AnimationEngine {
  private state: AnimationEngineState;
  private metrics: AnimationMetrics;
  private callbacks: Set<AnimationEngineCallback>;

  constructor() {
    this.state = {
      currentAnimation: 'idle',
      animationMixer: null,
      actions: new Map(),
      isPlaying: false,
      currentWeight: 1.0,
      blendDuration: 0.3
    };

    this.metrics = {
      activeAnimations: 0,
      totalActions: 0,
      currentWeight: 1.0,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 0
    };

    this.callbacks = new Set();
  }

  subscribe(callback: AnimationEngineCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  @Profile()
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.getMetrics()));
  }

  @HandleError()
  initializeMixer(object: THREE.Object3D): void {
    this.state.animationMixer = new THREE.AnimationMixer(object);
  }

  @HandleError()
  addAnimation(name: string, clip: THREE.AnimationClip): void {
    if (!this.state.animationMixer) return;
    
    const action = this.state.animationMixer.clipAction(clip);
    this.state.actions.set(name, action);
    this.updateMetrics();
    this.notifyCallbacks();
  }

  @HandleError()
  registerAction(name: string, action: THREE.AnimationAction): void {
    this.state.actions.set(name, action);
    this.updateMetrics();
    this.notifyCallbacks();
  }

  @HandleError()
  @Profile()
  playAnimation(name: string, fadeInDuration: number = this.state.blendDuration): void {
    const targetAction = this.state.actions.get(name);
    if (!targetAction) return;
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction && currentAction !== targetAction) {
      currentAction.fadeOut(fadeInDuration);
    }
    targetAction.reset().fadeIn(fadeInDuration).play();
    this.state.currentAnimation = name;
    this.state.isPlaying = true;
    this.updateMetrics();
    this.notifyCallbacks();
  }

  @HandleError()
  stopAnimation(): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.stop();
    }
    this.state.isPlaying = false;
    this.state.currentAnimation = 'idle';
    this.updateMetrics();
    this.notifyCallbacks();
  }

  @HandleError()
  setWeight(weight: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.weight = weight;
      this.state.currentWeight = weight;
      this.updateMetrics();
      this.notifyCallbacks();
    }
  }

  @HandleError()
  setTimeScale(scale: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.timeScale = scale;
      this.notifyCallbacks();
    }

  }

  @Profile()
  @TrackCalls()
  update(deltaTime: number): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.update(deltaTime);
      this.metrics.mixerTime += deltaTime;
      this.metrics.lastUpdate = Date.now();
      if (this.callbacks.size > 0) {
        this.updateMetrics();
        this.notifyCallbacks();
      }
    }
  }

  getCurrentAnimation(): string {
    return this.state.currentAnimation;
  }

  getAnimationList(): string[] {
    return Array.from(this.state.actions.keys());
  }

  @MonitorMemory(5)
  getMetrics(): AnimationMetrics {
    return { ...this.metrics };
  }

  @MonitorMemory(5)
  getState(): Readonly<AnimationEngineState> {
    return { ...this.state };
  }

  @Profile()
  private updateMetrics(): void {
    this.metrics.activeAnimations = Array.from(this.state.actions.values())
      .filter(action => action.isRunning()).length;
    this.metrics.totalActions = this.state.actions.size;
    this.metrics.currentWeight = this.state.currentWeight;
  }

  @HandleError()
  clearActions(): void {
    this.state.actions.forEach(action => {
      if (action.isRunning()) {
        action.stop();
      }
    });
    this.state.actions.clear();
    this.state.currentAnimation = 'idle';
    this.state.isPlaying = false;
    this.updateMetrics();
    this.notifyCallbacks();
  }

  @HandleError()
  dispose(): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.stopAllAction();
      this.state.animationMixer = null;
    }
    this.state.actions.clear();
    this.callbacks.clear();
  }
}

