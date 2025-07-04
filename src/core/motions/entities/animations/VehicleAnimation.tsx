import { useGaesupStore } from '@/core/stores/gaesupStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type AnimationActions = {
  [key: string]: THREE.AnimationAction | undefined;
  idle?: THREE.AnimationAction;
  walk?: THREE.AnimationAction;
  run?: THREE.AnimationAction;
  fly?: THREE.AnimationAction;
};

export function VehicleAnimation({
  actions,
  isActive = false,
  modeType = 'vehicle'
}: {
  actions: AnimationActions;
  isActive?: boolean;
  modeType?: string;
}) {
  const keyboard = useGaesupStore((state) => state.interaction?.keyboard);
  const prevStateRef = useRef({ isMoving: false, isRunning: false });

  useEffect(() => {
    if (!isActive || !actions) return;
    const isMoving = keyboard?.forward || keyboard?.backward;
    const isRunning = keyboard?.shift && isMoving;
    const prevState = prevStateRef.current;
    if (prevState.isMoving === isMoving && prevState.isRunning === isRunning) {
      return;
    }
    prevStateRef.current = { isMoving, isRunning };
    Object.values(actions).forEach((action) => {
      if (action) action.stop();
    });
    if (modeType === 'airplane') {
      if (actions.fly) {
        actions.fly.reset().play();
      } else if (actions.idle) {
        actions.idle.reset().play();
      }
    } else {
      if (isRunning && actions.run) {
        actions.run.reset().play();
      } else if (isMoving && actions.walk) {
        actions.walk.reset().play();
      } else if (actions.idle) {
        actions.idle.reset().play();
      }
    }
  }, [
    actions,
    isActive,
    keyboard?.forward,
    keyboard?.backward,
    keyboard?.shift,
    modeType
  ]);

  return null;
} 