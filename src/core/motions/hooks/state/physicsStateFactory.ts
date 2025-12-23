import * as THREE from 'three';

import { StoreState } from '@core/stores/types';

import { EntityStateManager } from '../../core/system/EntityStateManager';
import { PhysicsInputState, PhysicsState } from '../types';

function createInitialPhysicsState(
  worldContext: StoreState,
  stateManager: EntityStateManager,
  input: PhysicsInputState,
  delta: number,
  mouseTarget: THREE.Vector3
): PhysicsState {
  const modeType = worldContext.mode?.type || 'character';
  const activeStateRef = stateManager.getActiveState();
  const gameStatesRef = stateManager.getGameStates();

  const automationOption = worldContext.automation;

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