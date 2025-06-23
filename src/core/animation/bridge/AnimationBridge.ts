import { AnimationEngine, AnimationMetrics } from '../core/AnimationEngine';
import { AnimationCommand, AnimationSnapshot, AnimationType } from '../core/types';

export class AnimationBridge {
  private engines: Map<AnimationType, AnimationEngine>;
  private eventListeners: Set<(snapshot: AnimationSnapshot) => void>;

  constructor() {
    this.engines = new Map();
    this.eventListeners = new Set();
    
    this.engines.set('character', new AnimationEngine());
    this.engines.set('vehicle', new AnimationEngine());
    this.engines.set('airplane', new AnimationEngine());
  }

  execute(type: AnimationType, command: AnimationCommand): void {
    const engine = this.engines.get(type);
    if (!engine) return;

    switch (command.type) {
      case 'play':
        if (command.animation) {
          engine.playAnimation(command.animation, command.duration);
        }
        break;
      case 'stop':
        engine.stopAnimation();
        break;
      case 'setWeight':
        if (command.weight !== undefined) {
          engine.setWeight(command.weight);
        }
        break;
      case 'setSpeed':
        if (command.speed !== undefined) {
          engine.setTimeScale(command.speed);
        }
        break;
    }

    this.notifyListeners(type);
  }

  snapshot(type: AnimationType): AnimationSnapshot {
    const engine = this.engines.get(type);
    if (!engine) {
      return this.getEmptySnapshot();
    }

    const state = engine.getState();
    const metrics = engine.getMetrics();

    return {
      currentAnimation: state.currentAnimation,
      isPlaying: state.isPlaying,
      weight: state.currentWeight,
      speed: 1.0,
      availableAnimations: engine.getAnimationList(),
      metrics: {
        activeAnimations: metrics.activeAnimations,
        totalActions: metrics.totalActions,
        mixerTime: metrics.mixerTime,
        lastUpdate: metrics.lastUpdate
      }
    };
  }

  getMetrics(type: AnimationType): AnimationMetrics | null {
    const engine = this.engines.get(type);
    return engine ? engine.getMetrics() : null;
  }

  subscribe(listener: (snapshot: AnimationSnapshot) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private notifyListeners(type: AnimationType): void {
    const snapshot = this.snapshot(type);
    this.eventListeners.forEach(listener => listener(snapshot));
  }

  private getEmptySnapshot(): AnimationSnapshot {
    return {
      currentAnimation: 'idle',
      isPlaying: false,
      weight: 0,
      speed: 1,
      availableAnimations: [],
      metrics: {
        activeAnimations: 0,
        totalActions: 0,
        mixerTime: 0,
        lastUpdate: 0
      }
    };
  }

  update(type: AnimationType, deltaTime: number): void {
    const engine = this.engines.get(type);
    if (engine) {
      engine.update(deltaTime);
    }
  }

  dispose(): void {
    this.engines.forEach(engine => engine.dispose());
    this.engines.clear();
    this.eventListeners.clear();
  }
}
