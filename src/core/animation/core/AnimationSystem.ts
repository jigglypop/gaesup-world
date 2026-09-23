import * as THREE from 'three';

import { ManageRuntime } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';

import { AnimatorRuntime } from './animator/AnimatorRuntime';
import { ThreeAnimatorBinding } from './animator/ThreeAnimatorBinding';
import type {
  AnimatorControllerDefinition,
  AnimatorEvent,
  AnimatorEventListener,
} from './animator/types';
import { validateAnimatorController } from './animator/validate';
import {
  AnimationSystemState,
  AnimationSystemCallback,
  AnimatorLease,
} from './types';
import { AnimationMetrics } from '../bridge/types';


interface AnimationSystemMetrics extends BaseMetrics, AnimationMetrics {}
interface AnimationSystemStateExt extends BaseState, AnimationSystemState {}

type AnimatorLeaseEntry = {
  lease: AnimatorLease;
  definition: AnimatorControllerDefinition;
};

@ManageRuntime({ autoStart: false })
export class AnimationSystem extends AbstractSystem<AnimationSystemStateExt, AnimationSystemMetrics> {
  private callbacks: Set<AnimationSystemCallback>;
  private systemType: string;
  private animationNames: string[] | null = null;
  private animator: AnimatorRuntime | null = null;
  private animatorBinding: ThreeAnimatorBinding | null = null;
  private animatorDefinition: AnimatorControllerDefinition | null = null;
  private animatorUnsubscribe: (() => void) | null = null;
  private readonly animatorLeases: AnimatorLeaseEntry[] = [];
  private readonly animatorListeners = new Set<AnimatorEventListener>();
  private nextLeaseId = 1;
  private readonly legacyContext: SystemContext = { deltaTime: 0, totalTime: 0, frameCount: 0 };
  private readonly forwardAnimatorEvent = (event: AnimatorEvent) => {
    this.animatorListeners.forEach((listener) => listener(event));
  };

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

  getSystemType(): string {
    return this.systemType;
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
    this.registerAction(name, action);
  }

  registerAction(name: string, action: THREE.AnimationAction): void {
    const previous = this.state.actions.get(name);
    if (previous && previous !== action) previous.stop();
    if (!previous) this.animationNames = null;
    this.state.actions.set(name, action);
    if (previous !== action) this.handleActionsChanged();
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  unregisterAction(name: string, expected: THREE.AnimationAction): void {
    if (this.state.actions.get(name) !== expected) return;
    expected.stop();
    this.state.actions.delete(name);
    this.animationNames = null;
    this.handleActionsChanged();
    if (this.state.currentAnimation === name) this.state.currentAnimation = 'idle';
    this.updateMetrics(0);
    this.state.isPlaying = this.metrics.activeAnimations > 0;
    this.notifyCallbacks();
  }

  acquireAnimator(definition: AnimatorControllerDefinition): AnimatorLease {
    const validation = validateAnimatorController(definition);
    if (!validation.valid) {
      const first = validation.issues[0];
      throw new Error(
        `[AnimationSystem Error]: 잘못된 애니메이터 ${definition.id} (${first?.path}: ${first?.message})`,
      );
    }
    const lease: AnimatorLease = { id: this.nextLeaseId++ };
    this.animatorLeases.push({ lease, definition });
    try {
      this.rebuildAnimator();
    } catch (error) {
      this.animatorLeases.pop();
      throw error;
    }
    return lease;
  }

  releaseAnimator(lease: AnimatorLease): void {
    const index = this.animatorLeases.findIndex((entry) => entry.lease === lease);
    if (index < 0) return;
    this.animatorLeases.splice(index, 1);
    this.rebuildAnimator();
    this.notifyCallbacks();
  }

  isAnimatorOwner(lease: AnimatorLease): boolean {
    return this.animatorLeases[0]?.lease === lease;
  }

  getAnimator(): AnimatorRuntime | null {
    return this.animator;
  }

  onAnimatorEvent(listener: AnimatorEventListener): () => void {
    this.animatorListeners.add(listener);
    return () => {
      this.animatorListeners.delete(listener);
    };
  }

  private rebuildAnimator(): void {
    const owner = this.animatorLeases[0];
    if (!owner) {
      this.teardownAnimator();
      return;
    }
    if (this.animator && owner.definition === this.animatorDefinition) return;
    this.teardownAnimator();
    const binding = new ThreeAnimatorBinding(
      (clip) => this.resolveAction(clip),
      owner.definition.layers,
    );
    const runtime = new AnimatorRuntime(owner.definition, binding);
    this.animator = runtime;
    this.animatorBinding = binding;
    this.animatorDefinition = owner.definition;
    this.animatorUnsubscribe = runtime.onEvent(this.forwardAnimatorEvent);
    this.syncAnimatorState();
  }

  private teardownAnimator(): void {
    this.animatorUnsubscribe?.();
    this.animatorUnsubscribe = null;
    this.animator?.dispose();
    this.animator = null;
    this.animatorBinding = null;
    this.animatorDefinition = null;
  }

  private resolveAction(clip: string): THREE.AnimationAction | null {
    const exact = this.state.actions.get(clip);
    if (exact) return exact;
    const normalized = clip.toLowerCase();
    for (const [name, action] of this.state.actions) {
      if (name.toLowerCase() === normalized) return action;
    }
    return null;
  }

  private handleActionsChanged(): void {
    if (!this.animator || !this.animatorBinding) return;
    this.animatorBinding.invalidate();
    this.animator.refreshBindings();
    this.syncAnimatorState();
  }

  private syncAnimatorState(): void {
    const animator = this.animator;
    if (!animator) return;
    const dominant = animator.getDominantClip();
    if (dominant) this.state.currentAnimation = dominant;
    this.state.isPlaying = animator.isEnabled() && dominant !== '';
  }

  playAnimation(name: string, fadeInDuration: number = this.state.blendDuration): void {
    if (this.animator) {
      if (!this.animator.play(name, fadeInDuration)) return;
      this.animator.setEnabled(true);
      this.state.currentAnimation = name;
      this.state.isPlaying = true;
      this.updateMetrics(0);
      this.notifyCallbacks();
      return;
    }
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
    if (this.animator) {
      this.animator.setEnabled(false);
      this.state.isPlaying = false;
      this.state.currentAnimation = 'idle';
      this.updateMetrics(0);
      this.notifyCallbacks();
      return;
    }
    this.state.actions.forEach(action => action.stop());
    this.state.isPlaying = false;
    this.state.currentAnimation = 'idle';
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  setWeight(weight: number): void {
    if (this.animator) {
      this.animator.setLayerWeight(0, weight);
      this.state.currentWeight = this.animator.getLayerWeight(0);
      this.updateMetrics(0);
      this.notifyCallbacks();
      return;
    }
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.weight = weight;
      this.state.currentWeight = weight;
      this.updateMetrics(0);
      this.notifyCallbacks();
    }
  }

  setTimeScale(scale: number): void {
    if (this.animator) {
      this.animator.setSpeed(scale);
      this.notifyCallbacks();
      return;
    }
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

  protected createUpdateArgs(context: SystemContext): SystemContext {
    return context;
  }

  updateAnimation(deltaTime: number, lease?: AnimatorLease): void {
    if (this.animator) {
      if (lease && !this.isAnimatorOwner(lease)) return;
      if (!this.animator.update(deltaTime)) return;
      this.syncAnimatorState();
      this.updateMetrics(0);
      this.notifyCallbacks();
      return;
    }
    this.legacyContext.deltaTime = deltaTime * 1000;
    super.update(this.legacyContext);
    this.state.isPlaying = this.metrics.activeAnimations > 0;
    
    if (this.callbacks.size > 0) {
      this.notifyCallbacks();
    }
  }

  getCurrentAnimation(): string {
    return this.state.currentAnimation;
  }

  getAnimationList(): string[] {
    this.animationNames ??= Array.from(this.state.actions.keys());
    return this.animationNames;
  }

  override getMetrics(): AnimationSystemMetrics {
    return this.metrics;
  }

  override getState(): Readonly<AnimationSystemStateExt> {
    return this.state;
  }

  protected override updateMetrics(deltaTime: number): void {
    this.metrics.frameTime = deltaTime;
    let active = 0;
    for (const action of this.state.actions.values()) {
      if (action.isRunning()) active++;
    }
    this.metrics.activeAnimations = active;
    this.metrics.totalActions = this.state.actions.size;
    this.metrics.currentWeight = this.state.currentWeight;
    this.metrics.lastUpdate = Date.now();
  }

  clearActions(): void {
    this.animationNames = null;
    this.state.actions.forEach(action => {
      if (action.isRunning()) {
        action.stop();
      }
    });
    this.state.actions.clear();
    this.handleActionsChanged();
    this.state.currentAnimation = 'idle';
    this.state.isPlaying = false;
    this.updateMetrics(0);
    this.notifyCallbacks();
  }

  protected override onDispose(): void {
    this.teardownAnimator();
    this.animatorLeases.length = 0;
    this.animatorListeners.clear();
    this.animationNames = null;
    if (this.state.animationMixer) {
      this.state.animationMixer.stopAllAction();
      this.state.animationMixer = null;
    }
    this.state.actions.clear();
    this.callbacks.clear();
  }
}

