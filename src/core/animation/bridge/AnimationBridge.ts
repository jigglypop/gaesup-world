import * as THREE from 'three'

import { CoreBridge } from '@/core/boilerplate'

import { AnimationCommand, AnimationSnapshot, AnimationMetrics } from './types'
import { DomainBridge, EnableMetrics, Command } from '../../boilerplate/decorators'
import { LogSnapshot, ValidateCommand, RequireEngineById } from '../../boilerplate/decorators'
import { logger } from '../../utils/logger'
import { AnimationSystem } from '../core/AnimationSystem'
import type { AnimatorRuntime } from '../core/animator/AnimatorRuntime'
import type {
  AnimatorControllerDefinition,
  AnimatorEventListener,
  AnimatorParameterValue,
} from '../core/animator/types'
import { AnimationType, AnimatorLease } from '../core/types'

function sanitizeAnimationName(name: string): string {
  // Some GLBs contain control chars in clip names (e.g. "\brun") which breaks lookups.
  return name.replace(/[\x00-\x1F\x7F]/g, '').trim()
}



@DomainBridge('animation')
@EnableMetrics()
export class AnimationBridge extends CoreBridge<
  AnimationSystem,
  AnimationSnapshot,
  AnimationCommand
> {
  private readonly engineSnapshots = new WeakMap<AnimationSystem, AnimationSnapshot>()
  constructor() {
    super()
    const engineTypes: AnimationType[] = ['character', 'vehicle', 'airplane']
    engineTypes.forEach(type => {
      // buildEngine() already creates AnimationSystem; avoid double instantiation.
      this.register(type)
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
      const cleanName = sanitizeAnimationName(name)
      const finalName = cleanName.length > 0 ? cleanName : name
      engine.registerAction(finalName, action)
    }
  }

  registerAnimations(type: AnimationType, actions: Record<string, THREE.AnimationAction | null>): void {
    const engine = this.getEngine(type)
    if (!engine) return
    Object.entries(actions).forEach(([name, action]) => {
      if (action) {
        const cleanName = sanitizeAnimationName(name)
        const finalName = cleanName.length > 0 ? cleanName : name
        engine.registerAction(finalName, action)
      }
    })
  }

  @RequireEngineById()
  unregisterAnimations(type: AnimationType, actions?: Record<string, THREE.AnimationAction | null>): void {
    const engine = this.getEngine(type)
    if (!engine) return
    if (!actions) {
      engine.clearActions()
      return
    }
    Object.entries(actions).forEach(([name, action]) => {
      if (action) engine.unregisterAction(sanitizeAnimationName(name) || name, action)
    })
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
      case 'setParameter':
        if (command.parameter && command.value !== undefined) {
          engine.getAnimator()?.setParameter(command.parameter, command.value)
        }
        break
      case 'trigger':
        if (command.parameter) engine.getAnimator()?.setTrigger(command.parameter)
        break
    }
  }

  @LogSnapshot()
  protected createSnapshot(engine: AnimationSystem): AnimationSnapshot {
    const state = engine.getState()
    const metrics = engine.getMetrics()
    const speed = state.actions.get(state.currentAnimation)?.timeScale ?? 1
    let snapshot = this.engineSnapshots.get(engine)
    if (!snapshot) {
      snapshot = {
        animatorState: engine.getAnimator()?.getCurrentState() ?? null,
        currentAnimation: state.currentAnimation,
        isPlaying: state.isPlaying,
        weight: state.currentWeight,
        speed,
        availableAnimations: engine.getAnimationList(),
        metrics: {
          activeAnimations: metrics.activeAnimations,
          totalActions: metrics.totalActions,
          mixerTime: metrics.mixerTime,
          lastUpdate: metrics.lastUpdate,
        },
      }
      this.engineSnapshots.set(engine, snapshot)
    } else {
      snapshot.animatorState = engine.getAnimator()?.getCurrentState() ?? null
      snapshot.currentAnimation = state.currentAnimation
      snapshot.isPlaying = state.isPlaying
      snapshot.weight = state.currentWeight
      snapshot.speed = speed
      snapshot.availableAnimations = engine.getAnimationList()
      snapshot.metrics.activeAnimations = metrics.activeAnimations
      snapshot.metrics.totalActions = metrics.totalActions
      snapshot.metrics.mixerTime = metrics.mixerTime
      snapshot.metrics.lastUpdate = metrics.lastUpdate
    }
    return snapshot
  }

  @RequireEngineById()
  getMetrics(type: AnimationType): AnimationMetrics | null {
    const engine = this.getEngine(type)
    return engine ? engine.getMetrics() : null
  }

  @RequireEngineById()
  update(type: AnimationType, deltaTime: number, lease?: AnimatorLease): void {
    const engine = this.getEngine(type)
    if (engine) {
      engine.updateAnimation(deltaTime, lease)
    }
  }

  tickAnimator(type: AnimationType, deltaTime: number, lease: AnimatorLease): void {
    this.getEngine(type)?.updateAnimation(deltaTime, lease)
  }

  acquireAnimator(type: AnimationType, definition: AnimatorControllerDefinition): AnimatorLease | null {
    const engine = this.getEngine(type)
    if (!engine) return null
    try {
      return engine.acquireAnimator(definition)
    } catch (error) {
      logger.error(
        `[AnimationBridge Error]: 애니메이터 연결 실패 ${type}/${definition.id}`,
        error instanceof Error ? error : String(error),
      )
      return null
    }
  }

  releaseAnimator(type: AnimationType, lease: AnimatorLease): void {
    this.getEngine(type)?.releaseAnimator(lease)
  }

  getAnimator(type: AnimationType): AnimatorRuntime | null {
    return this.getEngine(type)?.getAnimator() ?? null
  }

  setAnimatorParameter(type: AnimationType, name: string, value: AnimatorParameterValue): void {
    this.getEngine(type)?.getAnimator()?.setParameter(name, value)
  }

  setAnimatorTrigger(type: AnimationType, name: string): void {
    this.getEngine(type)?.getAnimator()?.setTrigger(name)
  }

  onAnimatorEvent(type: AnimationType, listener: AnimatorEventListener): () => void {
    const engine = this.getEngine(type)
    if (!engine) return () => undefined
    return engine.onAnimatorEvent(listener)
  }

  override execute(type: AnimationType, command: AnimationCommand): void {
    super.execute(type, command)
  }

  @LogSnapshot()
  override snapshot(type: AnimationType): AnimationSnapshot | null {
    const result = super.snapshot(type)
    if (!result) {
      return {
        animatorState: null,
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
