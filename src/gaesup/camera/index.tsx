import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSnapshot } from 'valtio';
import * as THREE from 'three';
import { gameStore } from '../store/gameStore';
import { gameActions } from '../store/actions';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { CameraBlendManager } from './blend/CameraBlendManager';
import { SmartCollisionSystem } from './collision/SmartCollisionSystem';
import chase from './control/chase';
import firstPerson from './control/firstPerson';
import fixed from './control/fixed';
import isometric from './control/isometric';
import shoulder from './control/shoulder';
import sideScroll from './control/sideScroll';
import thirdPerson, { makeThirdPersonCameraPosition } from './control/thirdPerson';
import topDown from './control/topDown';
import { CameraEffects } from './effects/CameraEffects';
import { CameraStateManager } from './state/CameraStateManager';
import { CameraPropType } from './types';
import { CAMERA_CONSTANTS, cameraUtils } from './utils';

const controllerMap = {
  firstPerson,
  thirdPerson,
  normal: thirdPerson,
  chase,
  topDown,
  sideScroll,
  shoulder,
  fixed,
  isometric,
} as const;

export default function Camera(prop: CameraPropType) {
  // UI 상태: useSnapshot으로 반응형 처리 (UI에서 변경 감지 필요)
  const cameraOption = useSnapshot(gameStore.ui.cameraOption);
  const mode = useSnapshot(gameStore.ui.mode);
  const blocks = useSnapshot(gameStore.input.blocks);

  // 성능 최적화: ref 사용
  const lastModeControlRef = useRef<string | null>(null);
  const lastActiveStateRef = useRef<any>(null);
  const throttleTimeRef = useRef(0);
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);
  const lastTargetRef = useRef<THREE.Vector3 | null>(null);
  const blendManagerRef = useRef(new CameraBlendManager());
  const collisionSystemRef = useRef(new SmartCollisionSystem());
  const stateManagerRef = useRef(new CameraStateManager(blendManagerRef.current));
  const effectsRef = useRef(new CameraEffects());

  const propWithCamera = useMemo(
    () => ({
      ...prop,
      cameraOption,
    }),
    [prop, cameraOption],
  );

  // 모드 변경 감지하여 카메라 옵션 업데이트
  useEffect(() => {
    const control = mode.control;
    if (lastModeControlRef.current === control) return;
    lastModeControlRef.current = control;

    const newCameraOption: any = {};

    switch (control) {
      case 'firstPerson':
        newCameraOption.yDistance = 1.6;
        newCameraOption.smoothing = { position: 0.15, rotation: 0.15, fov: 0.1 };
        break;
      case 'chase':
        newCameraOption.smoothing = { position: 0.15, rotation: 0.12, fov: 0.1 };
        newCameraOption.yDistance = 3;
        break;
      case 'topDown':
        newCameraOption.yDistance = 10;
        newCameraOption.smoothing = { position: 0.05, rotation: 0.05, fov: 0.1 };
        break;
      case 'shoulder':
        newCameraOption.shoulderOffset =
          newCameraOption.shoulderOffset || new THREE.Vector3(0.5, 1.5, -1);
        newCameraOption.smoothing = { position: 0.1, rotation: 0.12, fov: 0.1 };
        break;
      case 'sideScroll':
        newCameraOption.fixedPosition =
          newCameraOption.fixedPosition || new THREE.Vector3(0, 5, 15);
        newCameraOption.smoothing = { position: 0.08, rotation: 0.08, fov: 0.1 };
        break;
      case 'isometric':
        newCameraOption.isoAngle = newCameraOption.isoAngle || 45;
        newCameraOption.yDistance = 8;
        newCameraOption.smoothing = { position: 0.06, rotation: 0.06, fov: 0.1 };
        break;
      default:
        newCameraOption.smoothing = { position: 0.1, rotation: 0.1, fov: 0.1 };
        break;
    }
    gameActions.updateCameraOption(newCameraOption);
  }, [mode.control]);

  const frameCallback = useCallback(
    (state: any) => {
      propWithCamera.state = state;

      if (!blocks.camera && state.camera) {
        stateManagerRef.current.checkAutoTransitions();
        effectsRef.current.update(state.delta, state.camera);
        const isBlending = blendManagerRef.current.update(state.delta, state.camera);

        if (!isBlending) {
          const currentState = stateManagerRef.current.getCurrentState();
          const control = mode.control || currentState?.type || 'thirdPerson';
          const controller = controllerMap[control as keyof typeof controllerMap] || thirdPerson;

          const propWithDelta = {
            ...propWithCamera,
            worldContext: {
              ...propWithCamera.worldContext,
              activeState: gameStore.physics.activeState,
              mode,
            },
            state: { ...state, delta: state.delta || 0.016 },
          };

          // 컨트롤러가 카메라 위치 계산 및 모든 업데이트 처리
          controller(propWithDelta);

          // 충돌 감지
          const outerGroup = gameStore.physics.refs.outerGroupRef?.current;
          if (state.scene && outerGroup) {
            const safePos = collisionSystemRef.current.checkCollision(
              state.camera.position,
              gameStore.camera.target, // target을 ref store에서 가져옴
              state.scene,
              [outerGroup],
            );
            state.camera.position.copy(safePos);
          }

          // 최종 카메라 상태를 ref store에 업데이트
          gameActions.updateCameraState({
            position: state.camera.position.clone(),
            target: gameStore.camera.target.clone(),
          });
        }
      }
    },
    [propWithCamera, blocks.camera, mode],
  );

  useUnifiedFrame(`camera-${mode.control || 'default'}`, frameCallback, 1, !blocks.camera);

  return {
    blendManager: blendManagerRef.current,
    collisionSystem: collisionSystemRef.current,
    stateManager: stateManagerRef.current,
    effects: effectsRef.current,
  };
}
