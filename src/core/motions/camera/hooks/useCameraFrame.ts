import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { CameraOptionType } from '../../../types';

import { useUnifiedFrame } from '../../../hooks/useUnifiedFrame';
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
  const collisionSystemRef = useRef(new SmartCollisionSystem());
  const effectsRef = useRef(new CameraEffects());

  const propWithCameraOption = useMemo(() => ({ ...prop, cameraOption }), [prop, cameraOption]);

  const frameCallback = useCallback(
    (state: any) => {
      const propWithFullContext = {
        ...propWithCameraOption,
        worldContext: {
          activeState,
          mode,
        },
        state: { ...state, delta: state.delta },
      };

      if (!block.camera && state.camera) {
        checkAutoTransitions();
        effectsRef.current.update(state.delta, state.camera);

        const isBlending = blendManagerRef.current.update(state.delta, state.camera);
        if (!isBlending) {
          const control =
            currentCameraState?.type || mode?.control || 'thirdPerson';

          const controller =
            controllerMap[control as keyof typeof controllerMap] || controllerMap.thirdPerson;

          controller.update(propWithFullContext);

          if (
            state.scene &&
            (activeState as { mesh: THREE.Object3D })?.mesh
          ) {
            const targetPos = state.camera.position.clone();
            const safePos = collisionSystemRef.current.checkCollision(
              state.camera.position,
              targetPos,
              state.scene,
              [(activeState as { mesh: THREE.Object3D }).mesh],
            );
            state.camera.position.copy(safePos);
          }
        }
      }
    },
    [propWithCameraOption, cameraOption.target, checkAutoTransitions, currentCameraState, activeState, mode],
  );
  useUnifiedFrame(`camera-${mode?.control || 'default'}`, frameCallback, 1);
  return {
    blendManager: blendManagerRef.current,
    collisionSystem: collisionSystemRef.current,
    effects: effectsRef.current,
  };
}
