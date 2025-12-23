import * as THREE from 'three';

import { ManageRuntime } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';

import {
  AnimationSystemState,
  AnimationSystemCallback
} from './types';
import { AnimationMetrics } from '../bridge/types';


interface AnimationSystemMetrics extends BaseMetrics, AnimationMetrics {}
interface AnimationSystemStateExt extends BaseState, AnimationSystemState {}

@ManageRuntime({ autoStart: false })
export class AnimationSystem extends AbstractSystem<AnimationSystemStateExt, AnimationSystemMetrics> {
  private callbacks: Set<AnimationSystemCallback>;
  private systemType: string;

  constructor(type: string = 'default') {
    const defaultState: AnimationSystemStateExt = {
      currentAnimation: 'idle',
      animationMixer: null,
      actions: new Map(),
      isPlaying: false,
      currentWeight: 1.0,
      blendDuration: 0.3,
      lastUpdate: Date.now()
    };

    const defaultMetrics: AnimationSystemMetrics = {
      activeAnimations: 0,
      totalActions: 0,
      currentWeight: 1.0,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 0,
      frameTime: 0
    };

    super(defaultState, defaultMetrics);
    this.callbacks = new Set();
    this.systemType = type;
  }

  subscribe(callback: AnimationSystemCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.getMetrics()));
  }

  initializeMixer(object: THREE.Object3D): void {
    this.state.animationMixer = new THREE.AnimationMixer(object);
  }

  addAnimation(name: string, clip: THREE.AnimationClip): void {
    if (!this.state.animationMixer) return;
    
    const action = this.state.animationMixer.clipAction(clip);
    this.state.actions.set(name, action);
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  registerAction(name: string, action: THREE.AnimationAction): void {
    this.state.actions.set(name, action);
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

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
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  stopAnimation(): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.stop();
    }
    this.state.isPlaying = false;
    this.state.currentAnimation = 'idle';
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  setWeight(weight: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.weight = weight;
      this.state.currentWeight = weight;
      this.updateMetrics(0);
      this.notifyCallbacks();
    }
  }

  setTimeScale(scale: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.timeScale = scale;
      this.notifyCallbacks();
    }
  }

  // AbstractSystem의 추상 메서드 구현
  protected performUpdate(context: SystemContext): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.update(context.deltaTime / 1000); // ms to seconds
      this.metrics.mixerTime += context.deltaTime / 1000;
    }
  }

  // AnimationBridge에서 호출하는 update 메서드 (deltaTime 파라미터 유지)
  updateAnimation(deltaTime: number): void {
    const context: SystemContext = {
      deltaTime: deltaTime * 1000, // seconds to ms
      totalTime: 0,
      frameCount: 0
    };
    super.update(context);
    
    if (this.callbacks.size > 0) {
      this.notifyCallbacks();
    }
  }

  getCurrentAnimation(): string {
    return this.state.currentAnimation;
  }

  getAnimationList(): string[] {
    return Array.from(this.state.actions.keys());
  }

  override getMetrics(): AnimationSystemMetrics {
    return { ...this.metrics };
  }

  override getState(): Readonly<AnimationSystemStateExt> {
    return { ...this.state };
  }

  protected override updateMetrics(deltaTime: number): void {
    this.metrics.frameTime = deltaTime;
    this.metrics.activeAnimations = Array.from(this.state.actions.values())
      .filter(action => action.isRunning()).length;
    this.metrics.totalActions = this.state.actions.size;
    this.metrics.currentWeight = this.state.currentWeight;
    this.metrics.lastUpdate = Date.now();
  }

  clearActions(): void {
    this.state.actions.forEach(action => {
      if (action.isRunning()) {
        action.stop();
      }
    });
    this.state.actions.clear();
    this.state.currentAnimation = 'idle';
    this.state.isPlaying = false;
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  protected override onDispose(): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.stopAllAction();
      this.state.animationMixer = null;
    }
    this.state.actions.clear();
    this.callbacks.clear();
  }
}

