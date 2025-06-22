import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RootState, useFrame } from '@react-three/fiber';
import { useGaesupStore } from '@stores/gaesupStore';
import { CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { useCameraState } from './useCameraState';
import { CameraBlendManager, CameraEffects } from '..';
import { SmartCollisionSystem } from '../../systems/SmartCollisionSystem';
import { controllerMap } from '../control';

export function useCameraFrame(
  prop: { controllerOptions?: any },
  cameraOption: CameraOptionType,
) {
  const block = useGaesupStore((state) => state.block);
  const { cameraStates, currentCameraStateName } = useGaesupStore();
  const currentCameraState = useMemo(
    () => cameraStates.get(currentCameraStateName),
    [cameraStates, currentCameraStateName],
  );
  const activeState = useGaesupStore((state) => state.activeState);
  const mode = useGaesupStore((state) => state.mode);
  const blendManagerRef = useRef(new CameraBlendManager());
  const { checkAutoTransitions } = useCameraState(blendManagerRef.current);
  const cameraEffectsRef = useRef(new CameraEffects());

  const frameCallback = useCallback(
    (state: RootState, delta: number) => {
      if (!activeState || !mode?.control || block.camera) return;

      try {
        checkAutoTransitions(state.camera, activeState);
        const { camera } = state;
        const currentController = controllerMap[mode.control];
        if (!currentController) return;

        const currentBlendState = currentCameraState || blendManagerRef.current.getDefault();
        const blendedState = blendManagerRef.current.update(currentBlendState, delta);

        const cameraProp: CameraPropType = {
          state: { ...state, delta },
          worldContext: {
            activeState,
          },
          cameraOption: blendedState || cameraOption,
          controllerOptions: prop.controllerOptions,
        };

        currentController.update(cameraProp);

        cameraEffectsRef.current.update(camera, activeState, blendedState || cameraOption, delta);
      } catch (error) {
        console.error('Camera frame error:', error);
      }
    },
    [activeState, mode, block, currentCameraState, cameraOption, prop.controllerOptions, checkAutoTransitions],
  );

  useFrame(frameCallback);
}
