import { PhysicsState, PhysicsCalculationProps, automationType } from '../types';
import { StoreState } from '@core/stores/types';
import * as THREE from 'three';
import { EntityStateManager } from '../../core/system/EntityStateManager';

function createInitialPhysicsState(
  worldContext: StoreState,
  stateManager: EntityStateManager,
  input: PhysicsCalculationProps,
  delta: number,
  mouseTarget: THREE.Vector3
): PhysicsState {
  const modeType = worldContext.mode?.type || 'character';
  const activeStateRef = stateManager.getActiveState();
  const gameStatesRef = stateManager.getGameStates();

  const automationOption: automationType = worldContext.automation || {
    isActive: false,
    queue: {
      actions: [],
      currentIndex: 0,
      isRunning: false,
      isPaused: false,
      loop: false,
      maxRetries: 3,
    },
    settings: {
      trackProgress: false,
      autoStart: false,
      loop: false,
      showVisualCues: false,
    },
  };

  return {
    activeState: activeStateRef,
    gameStates: gameStatesRef,
    keyboard: { ...input.keyboard },
    mouse: {
      target: mouseTarget.copy(input.mouse.target),
      angle: input.mouse.angle,
      isActive: input.mouse.isActive,
      shouldRun: input.mouse.shouldRun,
    },
    automationOption,
    modeType: modeType as 'character' | 'vehicle' | 'airplane',
    delta,
  };
}

export { createInitialPhysicsState }; 