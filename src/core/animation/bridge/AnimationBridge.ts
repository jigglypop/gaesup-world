import { AnimationEngine } from '../core/AnimationEngine';
import { AnimationType } from '../core/types';
import {
  AnimationCommand,
  AnimationMetrics,
  AnimationSnapshot
} from './types';
import * as THREE from 'three';
import { BaseBridge } from '../../utils/BaseBridge';

export class AnimationBridge extends BaseBridge<
  AnimationEngine,
  AnimationSnapshot,
  AnimationCommand
> {
  constructor() {
    super();
    const engineTypes: AnimationType[] = ['character', 'vehicle', 'airplane'];
    engineTypes.forEach(type => {
      this.addEngine(type, new AnimationEngine());
    });
    this.setupEngineSubscriptions();
  }

  private setupEngineSubscriptions(): void {
    this.engines.forEach((engine, type) => {
      const unsubscribe = engine.subscribe(() => {
        this.notifyListeners(type);
      });
      this.unsubscribeFunctions.set(type, unsubscribe);
    });
  }
  registerAnimationAction(type: AnimationType, name: string, action: THREE.AnimationAction): void {
    const engine = this.getEngine(type);
    if (engine) {
      engine.registerAction(name, action);
    }
  }
  registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void {
    const engine = this.getEngine(type);
    if (!engine) return;
    Object.entries(actions).forEach(([name, action]) => {
      if (action) {
        engine.registerAction(name, action);
      }
    });
  }

  unregisterAnimations(type: AnimationType): void {
    const engine = this.getEngine(type);
    if (!engine) return;
    engine.clearActions();
  }

  execute(type: AnimationType, command: AnimationCommand): void {
    const engine = this.getEngine(type);
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
  }

  snapshot(type: AnimationType): AnimationSnapshot {
    const engine = this.getEngine(type);
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
    const engine = this.getEngine(type);
    return engine ? engine.getMetrics() : null;
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
    const engine = this.getEngine(type);
    if (engine) {
      engine.update(deltaTime);
    }
  }
}
