import { useCallback } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { CameraBlendManager } from '../blend/CameraBlendManager';
import { CameraState } from '../../types';

const MAX_HISTORY_SIZE = 10;

export function useCameraState(blendManager: CameraBlendManager) {
  const {
    cameraStates,
    cameraTransitions,
    currentCameraStateName,
    setCurrentCameraStateName,
    setCameraStateHistory,
    addCameraState,
  } = useGaesupStore();

  const setCameraState = useCallback(
    (stateName: string, immediate: boolean = false) => {
      if (!cameraStates.has(stateName)) {
        console.warn(`Camera state '${stateName}' not found`);
        return null;
      }

      const newState = cameraStates.get(stateName)!;
      const oldState = cameraStates.get(currentCameraStateName);

      setCameraStateHistory((prev) => {
        const newHistory = [...prev, currentCameraStateName];
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        return newHistory;
      });

      setCurrentCameraStateName(stateName);
      if (immediate || !oldState) {
      } else {
        const transition = cameraTransitions.find(
          (t) => t.from === oldState.name && t.to === newState.name,
        );
        const duration = transition?.duration || 1.0;
        const blendFunc = transition?.blendFunction || 'EaseInOut'; // Simplified

        blendManager.startBlend(
          {
            position: oldState.position,
            rotation: oldState.rotation,
            fov: oldState.fov,
            target: oldState.target,
          },
          {
            position: newState.position,
            rotation: newState.rotation,
            fov: newState.fov,
            target: newState.target,
          },
          duration,
          blendFunc as any,
        );
      }
      return newState;
    },
    [
      cameraStates,
      currentCameraStateName,
      cameraTransitions,
      blendManager,
      setCameraStateHistory,
      setCurrentCameraStateName,
    ],
  );

  const checkAutoTransitions = useCallback(() => {
    for (const transition of cameraTransitions) {
      if (transition.from === currentCameraStateName && transition.condition()) {
        setCameraState(transition.to);
        break;
      }
    }
  }, [cameraTransitions, currentCameraStateName, setCameraState]);

  const registerState = useCallback(
    (state: CameraState) => {
      addCameraState(state.name, state);
    },
    [addCameraState],
  );

  return { setCameraState, checkAutoTransitions, registerState };
}
