import { useEffect, useRef } from 'react';

import { FRAME_SCHEDULER_PRIORITY, useEngineFrame } from '@core/runtime/frame';

import type { UseCharacterAnimatorOptions } from './types';
import { getGlobalStateManager } from './useStateSystem';
import {
  CHARACTER_ANIMATOR_PARAMETERS,
  CHARACTER_LOCOMOTION,
  defaultCharacterAnimator,
} from '../../animation/core/animator';
import type { AnimatorRuntime } from '../../animation/core/animator/AnimatorRuntime';
import type { AnimatorLease } from '../../animation/core/types';
import { getGlobalAnimationBridge } from '../../animation/hooks/useAnimationBridge';

export const CHARACTER_ANIMATOR_FRAME_PRIORITY = FRAME_SCHEDULER_PRIORITY;
const DEFAULT_LOCOMOTION_RESPONSE = 12;

function setFloatIfDeclared(animator: AnimatorRuntime, name: string, value: number): void {
  if (typeof animator.getParameter(name) === 'number') animator.setFloat(name, value);
}

function setBoolIfDeclared(animator: AnimatorRuntime, name: string, value: boolean): void {
  if (typeof animator.getParameter(name) === 'boolean') animator.setBool(name, value);
}

export function useCharacterAnimator({
  enabled,
  type = 'character',
  controller = defaultCharacterAnimator,
  locomotionResponse = DEFAULT_LOCOMOTION_RESPONSE,
}: UseCharacterAnimatorOptions) {
  const leaseRef = useRef<AnimatorLease | null>(null);
  const locomotionRef = useRef<number>(CHARACTER_LOCOMOTION.idle);

  useEffect(() => {
    if (!enabled) return undefined;
    const bridge = getGlobalAnimationBridge();
    const lease = bridge.acquireAnimator(type, controller);
    leaseRef.current = lease;
    return () => {
      leaseRef.current = null;
      if (lease) bridge.releaseAnimator(type, lease);
    };
  }, [enabled, type, controller]);

  useEngineFrame('animation', (delta) => {
    const lease = leaseRef.current;
    if (!lease) return;
    const bridge = getGlobalAnimationBridge();
    const animator = bridge.getAnimator(type);
    if (!animator) return;
    const stateManager = getGlobalStateManager();
    const gameStates = stateManager.getGameStates();
    const velocity = stateManager.getActiveState().velocity;
    const target = gameStates.isMoving
      ? gameStates.isRunning
        ? CHARACTER_LOCOMOTION.run
        : CHARACTER_LOCOMOTION.walk
      : CHARACTER_LOCOMOTION.idle;
    const factor = 1 - Math.exp(-locomotionResponse * delta);
    locomotionRef.current += (target - locomotionRef.current) * factor;
    setFloatIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.locomotion, locomotionRef.current);
    setFloatIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.speed, Math.hypot(velocity.x, velocity.z));
    setBoolIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.riding, gameStates.isRiding);
    setBoolIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.jumping, gameStates.isJumping);
    setBoolIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.falling, gameStates.isFalling);
    setBoolIfDeclared(animator, CHARACTER_ANIMATOR_PARAMETERS.grounded, gameStates.isOnTheGround);
    bridge.tickAnimator(type, delta, lease);
  }, { active: enabled, label: 'motions:character-animator' });
}
