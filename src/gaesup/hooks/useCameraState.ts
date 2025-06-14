import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  cameraStatesAtom,
  cameraStateHistoryAtom,
  cameraTransitionsAtom,
  currentCameraStateNameAtom,
} from '../atoms/cameraStateAtoms';
import { CameraBlendManager } from '../camera';
import { CameraState } from '../types';

const MAX_HISTORY_SIZE = 10;

export function useCameraState(blendManager: CameraBlendManager) {
  const [states, setStates] = useAtom(cameraStatesAtom);
  const [transitions, setTransitions] = useAtom(cameraTransitionsAtom);
  const [currentName, setCurrentName] = useAtom(currentCameraStateNameAtom);
  const [history, setHistory] = useAtom(cameraStateHistoryAtom);

  const setCameraState = useCallback(
    (stateName: string, immediate: boolean = false) => {
      if (!states.has(stateName)) {
        console.warn(`Camera state '${stateName}' not found`);
        return null;
      }

      const newState = states.get(stateName)!;
      const oldState = states.get(currentName);

      setHistory((prev) => {
        const newHistory = [...prev, currentName];
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        return newHistory;
      });

      setCurrentName(stateName);

      if (immediate || !oldState) {
        // No blend, just set the state
      } else {
        const transition = transitions.find(
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
    [states, currentName, transitions, blendManager, setHistory, setCurrentName],
  );

  const checkAutoTransitions = useCallback(() => {
    for (const transition of transitions) {
      if (transition.from === currentName && transition.condition()) {
        setCameraState(transition.to);
        break;
      }
    }
  }, [transitions, currentName, setCameraState]);

  const registerState = useCallback(
    (state: CameraState) => {
      setStates((prev) => new Map(prev).set(state.name, state));
    },
    [setStates],
  );

  return { setCameraState, checkAutoTransitions, registerState };
}
