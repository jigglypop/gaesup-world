import { useSnapshot } from 'valtio';
import { useEffect, useRef } from 'react';
import { gameStore } from '../../store/gameStore';
import { AnimationActions } from './types';

function getActiveAnimationTag() {
  const gameStates = gameStore.gameStates;
  const keyboard = gameStore.input.keyboard;
  const pointer = gameStore.input.pointer;

  // 움직임 상태 계산
  const isKeyboardMoving =
    keyboard.forward || keyboard.backward || keyboard.leftward || keyboard.rightward;
  const isPointerMoving = pointer.isActive;
  const isMoving = isKeyboardMoving || isPointerMoving;
  const isRunning = (keyboard.shift && isKeyboardMoving) || (pointer.shouldRun && isPointerMoving);

  if (gameStates.isJumping) return 'jump';
  if (gameStates.isFalling) return 'fall';
  if (gameStates.isRiding) return 'ride';
  if (gameStates.isLanding) return 'land';
  if (isRunning) return 'run';
  if (isMoving) return 'walk';

  return 'idle';
}

export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
  const gameStates = useSnapshot(gameStore.gameStates);
  const keyboard = useSnapshot(gameStore.input.keyboard);
  const pointer = useSnapshot(gameStore.input.pointer);

  const activeTag = getActiveAnimationTag();
  const previousTag = useRef('idle');

  useEffect(() => {
    if (!active || !actions || activeTag === previousTag.current) return;
    const currentAction = actions[activeTag];
    const previousAction = actions[previousTag.current];
    if (previousAction) {
      previousAction.fadeOut(0.2);
    }
    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }
    previousTag.current = activeTag;
  }, [activeTag, actions, active, gameStates, keyboard, pointer]);
}
