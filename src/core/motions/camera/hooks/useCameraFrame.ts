import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { CameraOptionType, gaesupWorldContextType } from '../../../types';
import { CameraPropType } from '../../types';
import { useUnifiedFrame } from '../../../hooks/useUnifiedFrame';
import { useCameraState } from './useCameraState';
import { eventBus } from '@motions/core';
import { CameraBlendManager, CameraEffects } from '..';
import { SmartCollisionSystem } from '../../systems/SmartCollisionSystem';
import { controllerMap } from '../control';

export function useCameraFrame(
  prop: Omit<CameraPropType, 'cameraOption' | 'state'>,
  cameraOption: CameraOptionType,
  setCameraOption: (update: React.SetStateAction<CameraOptionType>) => void,
) {
  const block = useGaesupStore((state) => state.block);
  const { cameraStates, currentCameraStateName } = useGaesupStore();
  const currentCameraState = useMemo(
    () => cameraStates.get(currentCameraStateName),
    [cameraStates, currentCameraStateName],
  );
  const lastActiveStateRef = useRef<Partial<gaesupWorldContextType['activeState']>>(null);
  const blendManagerRef = useRef(new CameraBlendManager());
  const { checkAutoTransitions } = useCameraState(blendManagerRef.current);
  const collisionSystemRef = useRef(new SmartCollisionSystem());
  const effectsRef = useRef(new CameraEffects());

  const propWithCameraOption = useMemo(() => ({ ...prop, cameraOption }), [prop, cameraOption]);

  useEffect(() => {
    const unsubscribePosition = eventBus.subscribe('POSITION_UPDATE', (data) => {
      // This logic for updating camera position might be better inside frameCallback
      // For now, we keep it to update the target ref for the controller
    });

    const unsubscribeRotation = eventBus.subscribe('ROTATION_UPDATE', (data) => {
      lastActiveStateRef.current = {
        ...prop.worldContext.activeState,
        euler: data.euler,
        direction: data.direction,
        dir: data.dir,
      };
    });

    return () => {
      unsubscribePosition();
      unsubscribeRotation();
    };
  }, [prop.worldContext.activeState, setCameraOption]);

  const frameCallback = useCallback(
    (state: any) => {
      const propWithFullContext = {
        ...propWithCameraOption,
        worldContext: {
          ...propWithCameraOption.worldContext,
          activeState: {
            ...propWithCameraOption.worldContext.activeState,
            ...lastActiveStateRef.current,
          },
        },
        state: { ...state, delta: state.delta },
      };

      if (!block.camera && state.camera) {
        checkAutoTransitions();
        effectsRef.current.update(state.delta, state.camera);

        const isBlending = blendManagerRef.current.update(state.delta, state.camera);
        if (!isBlending) {
          const control =
            prop.worldContext.mode?.control || currentCameraState?.type || 'thirdPerson';

          const controller =
            controllerMap[control as keyof typeof controllerMap] || controllerMap.thirdPerson;

          controller(propWithFullContext);

          if (state.scene && (propWithFullContext.worldContext.activeState as any)?.mesh) {
            const targetPos = state.camera.position.clone();
            const safePos = collisionSystemRef.current.checkCollision(
              state.camera.position,
              targetPos,
              state.scene,
              [(propWithFullContext.worldContext.activeState as any).mesh],
            );
            state.camera.position.copy(safePos);
          }
          eventBus.emit('CAMERA_UPDATE', {
            position: state.camera.position.clone(),
            target:
              cameraOption.target ||
              prop.worldContext.activeState?.position?.clone() ||
              new THREE.Vector3(),
            fov: state.camera instanceof THREE.PerspectiveCamera ? state.camera.fov : 75,
            mode: control,
            isBlending: false,
          });
        } else {
          eventBus.emit('CAMERA_UPDATE', {
            position: state.camera.position.clone(),
            target:
              cameraOption.target ||
              prop.worldContext.activeState?.position?.clone() ||
              new THREE.Vector3(),
            fov: state.camera instanceof THREE.PerspectiveCamera ? state.camera.fov : 75,
            mode: prop.worldContext.mode?.control || 'thirdPerson',
            isBlending: true,
          });
        }
      }
    },
    [propWithCameraOption, cameraOption.target, checkAutoTransitions, currentCameraState],
  );
  useUnifiedFrame(`camera-${prop.worldContext.mode?.control || 'default'}`, frameCallback, 1);
  return {
    blendManager: blendManagerRef.current,
    collisionSystem: collisionSystemRef.current,
    effects: effectsRef.current,
  };
}
