import { AnimationSystem } from '../core/AnimationSystem'
import { AnimationType } from '../core/types'
import { AnimationCommand, AnimationSnapshot, AnimationMetrics } from './types'
import { DomainBridge, EnableMetrics, Command } from '../../boilerplate/decorators'
import { LogSnapshot, ValidateCommand, RequireEngineById, CacheSnapshot } from '../../boilerplate/decorators'
import * as THREE from 'three'
import { CoreBridge } from '@/core/boilerplate'

@DomainBridge('animation')
@EnableMetrics()
export class AnimationBridge extends CoreBridge<
  AnimationSystem,
  AnimationSnapshot,
  AnimationCommand
> {
  constructor() {
    super()
    const engineTypes: AnimationType[] = ['character', 'vehicle', 'airplane']
    engineTypes.forEach(type => {
      this.register(type, new AnimationSystem(type))
    })
    this.setupEngineSubscriptions()
  }

  private setupEngineSubscriptions(): void {
    this.engines.forEach((engine, type) => {
      engine.subscribe(() => {
        this.notifyListeners(type)
      })
    })
  }

  protected buildEngine(id: string): AnimationSystem | null {
    return new AnimationSystem(id)
  }

  @RequireEngineById()
  registerAnimationAction(type: AnimationType, name: string, action: THREE.AnimationAction): void {
    const engine = this.getEngine(type)
    if (engine) {
      engine.registerAction(name, action)
    }
  }

  registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void {
    const engine = this.getEngine(type)
    if (!engine) return
    Object.entries(actions).forEach(([name, action]) => {
      if (action) {
        engine.registerAction(name, action)
      }
    })
  }

  @RequireEngineById()
  unregisterAnimations(type: AnimationType): void {
    const engine = this.getEngine(type)
    if (!engine) return
    engine.clearActions()
  }

  @Command('play')
  @ValidateCommand()
  protected executeCommand(engine: AnimationSystem, command: AnimationCommand): void {
    switch (command.type) {
      case 'play':
        if (command.animation) engine.playAnimation(command.animation, command.duration)
        break
      case 'stop':
        engine.stopAnimation()
        break
      case 'setWeight':
        if (command.weight !== undefined) engine.setWeight(command.weight)
        break
      case 'setSpeed':
        if (command.speed !== undefined) engine.setTimeScale(command.speed)
        break
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16) // 60fps 캐싱
  protected createSnapshot(engine: AnimationSystem): AnimationSnapshot {
    const state = engine.getState()
    const metrics = engine.getMetrics()
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
        lastUpdate: metrics.lastUpdate,
      },
    }
  }

  @RequireEngineById()
  getMetrics(type: AnimationType): AnimationMetrics | null {
    const engine = this.getEngine(type)
    return engine ? engine.getMetrics() : null
  }

  @RequireEngineById()
  update(type: AnimationType, deltaTime: number): void {
    const engine = this.getEngine(type)
    if (engine) {
      engine.updateAnimation(deltaTime)
    }
  }

  override execute(type: AnimationType, command: AnimationCommand): void {
    super.execute(type, command)
  }

  @LogSnapshot()
  @CacheSnapshot(16)
  override snapshot(type: AnimationType): AnimationSnapshot | null {
    const result = super.snapshot(type)
    if (!result) {
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
      }
    }
    return result
  }
}
