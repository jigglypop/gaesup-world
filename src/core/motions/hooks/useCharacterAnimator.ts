import { useEffect, useRef } from 'react';

import { FRAME_SCHEDULER_PRIORITY, useEngineFrame } from '@core/runtime/frame';

import type { UseCharacterAnimatorOptions } from './types';
import { useScopedStateManager } from './useStateSystem';
import type { AnimationBridge } from '../../animation/bridge/AnimationBridge';
import {
  CHARACTER_ANIMATOR_PARAMETERS,
  CHARACTER_LOCOMOTION,
  defaultCharacterAnimator,
} from '../../animation/core/animator';
import type { AnimatorRuntime } from '../../animation/core/animator/AnimatorRuntime';
import type { AnimatorLease } from '../../animation/core/types';
import { useScopedAnimationBridge } from '../../animation/hooks/useAnimationBridge';

type LeasedAnimator = { bridge: AnimationBridge; lease: AnimatorLease };

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
  const bridge = useScopedAnimationBridge();
  const stateManager = useScopedStateManager();
  const leaseRef = useRef<LeasedAnimator | null>(null);
  const locomotionRef = useRef<number>(CHARACTER_LOCOMOTION.idle);

  useEffect(() => {
    if (!enabled || !bridge) return undefined;
    const lease = bridge.acquireAnimator(type, controller);
    leaseRef.current = lease ? { bridge, lease } : null;
    return () => {
      leaseRef.current = null;
      if (lease) bridge.releaseAnimator(type, lease);
    };
  }, [bridge, enabled, type, controller]);

  useEngineFrame('animation', (delta) => {
    const leased = leaseRef.current;
    if (!leased) return;
    const { bridge: leasedBridge, lease } = leased;
    const animator = leasedBridge.getAnimator(type);
    if (!animator) return;
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
    leasedBridge.tickAnimator(type, delta, lease);
  }, { active: enabled, label: 'motions:character-animator' });
}
