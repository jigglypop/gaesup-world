import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RootState, useFrame } from '@react-three/fiber';
import { useGaesupStore } from '../../stores';
import { cameraUtils } from '../../utils/camera';
import { CameraOptionType } from '../../types/camera';
import { CameraPropType } from '../../types/camera';
import { useCameraState } from './useCameraState';
import { CameraBlendManager } from '../systems/CameraBlendManager';
import { CameraEffects } from '../systems/CameraEffects';
import { controllerMap } from '../../component/camera';

export function useCameraFrame(
  prop: { controllerOptions?: any },
  cameraOption: CameraOptionType,
) {
  const block = useGaesupStore((state) => state.block);
  const { cameraStates, currentCameraStateName } = useGaesupStore();
  const activeState = useGaesupStore((state) => state.activeState);
  const mode = useGaesupStore((state) => state.mode);
  
  const blendManagerRef = useRef(new CameraBlendManager());
  const cameraEffectsRef = useRef(new CameraEffects());
  const { checkAutoTransitions } = useCameraState(blendManagerRef.current);

  const currentCameraState = useMemo(
    () => cameraStates.get(currentCameraStateName),
    [cameraStates, currentCameraStateName],
  );

  const frameCallback = useCallback(
    (state: RootState, delta: number) => {
      if (!activeState || !mode?.control || block.camera) return;

      try {
        const { camera } = state;
        
        checkAutoTransitions(camera, activeState);

        const currentController = controllerMap[mode.control];
        if (!currentController) return;

        const baseState = currentCameraState || blendManagerRef.current.getDefault();
        const blendedState = blendManagerRef.current.update(baseState, delta);

        const cameraProp: CameraPropType = {
          state: { ...state, delta },
          worldContext: { activeState },
          cameraOption: blendedState,
          controllerOptions: prop.controllerOptions,
        };

        currentController.update(cameraProp);
        cameraEffectsRef.current.update(delta, camera);
      } catch (error) {
        console.error('Camera frame error:', error);
      }
    },
    [activeState, mode, block.camera, currentCameraState, prop.controllerOptions, checkAutoTransitions],
  );

  useFrame(frameCallback);
} 