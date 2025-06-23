import * as THREE from 'three';

export interface AnimationEngineState {
  currentAnimation: string;
  animationMixer: THREE.AnimationMixer | null;
  actions: Map<string, THREE.AnimationAction>;
  isPlaying: boolean;
  currentWeight: number;
  blendDuration: number;
}

export interface AnimationMetrics {
  activeAnimations: number;
  totalActions: number;
  currentWeight: number;
  mixerTime: number;
  lastUpdate: number;
  blendProgress: number;
}

export class AnimationEngine {
  private state: AnimationEngineState;
  private metrics: AnimationMetrics;

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
  }

  initializeMixer(object: THREE.Object3D): void {
    this.state.animationMixer = new THREE.AnimationMixer(object);
  }

  addAnimation(name: string, clip: THREE.AnimationClip): void {
    if (!this.state.animationMixer) return;
    
    const action = this.state.animationMixer.clipAction(clip);
    this.state.actions.set(name, action);
    this.updateMetrics();
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
    this.updateMetrics();
  }

  stopAnimation(): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.stop();
    }
    this.state.isPlaying = false;
    this.updateMetrics();
  }

  setWeight(weight: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.setWeight(weight);
      this.state.currentWeight = weight;
      this.updateMetrics();
    }
  }

  setTimeScale(scale: number): void {
    const currentAction = this.state.actions.get(this.state.currentAnimation);
    if (currentAction) {
      currentAction.setTimeScale(scale);
    }
  }

  update(deltaTime: number): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.update(deltaTime);
      this.metrics.mixerTime += deltaTime;
      this.metrics.lastUpdate = Date.now();
    }
  }

  getCurrentAnimation(): string {
    return this.state.currentAnimation;
  }

  getAnimationList(): string[] {
    return Array.from(this.state.actions.keys());
  }

  getMetrics(): AnimationMetrics {
    return { ...this.metrics };
  }

  getState(): Readonly<AnimationEngineState> {
    return { ...this.state };
  }

  private updateMetrics(): void {
    this.metrics.activeAnimations = Array.from(this.state.actions.values())
      .filter(action => action.isRunning()).length;
    this.metrics.totalActions = this.state.actions.size;
    this.metrics.currentWeight = this.state.currentWeight;
  }

  dispose(): void {
    if (this.state.animationMixer) {
      this.state.animationMixer.stopAllAction();
      this.state.animationMixer = null;
    }
    this.state.actions.clear();
  }
}
