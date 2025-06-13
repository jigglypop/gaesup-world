import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { blockAtom, cameraOptionAtom } from '../atoms';
import { gaesupWorldContextType } from '../atoms';
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
import { eventBus } from '../physics/connectors';

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
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const block = useAtomValue(blockAtom);
  const cameraOptionRef = useRef(cameraOption);
  const lastModeControlRef = useRef<string | null>(null);
  const lastActiveStateRef = useRef<Partial<gaesupWorldContextType['activeState']> | null>(null);
  const throttleTimeRef = useRef(0);
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);
  const lastTargetRef = useRef<THREE.Vector3 | null>(null);
  const blendManagerRef = useRef(new CameraBlendManager());
  const collisionSystemRef = useRef(new SmartCollisionSystem());
  const stateManagerRef = useRef(new CameraStateManager(blendManagerRef.current));
  const effectsRef = useRef(new CameraEffects());
  cameraOptionRef.current = cameraOption;
  const propWithCamera = useMemo(() => ({ ...prop, cameraOption }), [prop, cameraOption]);
  const updateCameraPosition = useCallback(
    (activeState: gaesupWorldContextType['activeState'], force = false) => {
      const currentMode = prop.worldContext.mode?.control || 'thirdPerson';
      const now = performance.now();
      if (!force && now - throttleTimeRef.current < CAMERA_CONSTANTS.THROTTLE_MS) return;
      throttleTimeRef.current = now;
      if (!activeState?.position) return;
      const currentOption = cameraOptionRef.current;
      const newPosition = makeThirdPersonCameraPosition(activeState, currentOption);
      const newTarget = activeState.position;
      if (!newTarget || !newPosition) return;
      const lastPos = lastPositionRef.current;
      const lastTar = lastTargetRef.current;
      const positionChanged =
        !lastPos ||
        !cameraUtils.isPositionEqual(newPosition, lastPos, CAMERA_CONSTANTS.POSITION_THRESHOLD);
      const targetChanged =
        !lastTar ||
        !cameraUtils.isPositionEqual(newTarget, lastTar, CAMERA_CONSTANTS.TARGET_THRESHOLD);
      if (positionChanged || targetChanged) {
        lastPositionRef.current = newPosition.clone();
        lastTargetRef.current = newTarget.clone();
        setCameraOption((prev: typeof cameraOption) => ({
          ...prev,
          target: newTarget.clone(),
          position: newPosition.clone(),
        }));
      }
    },
    [setCameraOption, prop.worldContext.mode?.control],
  );
  useEffect(() => {
    if (prop.worldContext.activeState?.position) {
      updateCameraPosition(prop.worldContext.activeState, true);
    }
  }, [prop.worldContext.activeState?.position, updateCameraPosition]);
  useEffect(() => {
    const unsubscribePosition = eventBus.subscribe('POSITION_UPDATE', (data) => {
      const activeState = {
        position: data.position,
        velocity: data.velocity,
        ...prop.worldContext.activeState,
      } as gaesupWorldContextType['activeState'];
      updateCameraPosition(activeState);
    });
    const unsubscribeRotation = eventBus.subscribe('ROTATION_UPDATE', (data) => {
      lastActiveStateRef.current = {
        ...prop.worldContext.activeState,
        euler: data.euler,
        direction: data.direction,
        dir: data.dir,
      };
    });
    const unsubscribeModeChange = eventBus.subscribe('MODE_CHANGE', (data) => {
      const newCameraOption = { ...cameraOption };
      switch (data.control) {
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
      setCameraOption(newCameraOption);
    });
    return () => {
      unsubscribePosition();
      unsubscribeRotation();
      unsubscribeModeChange();
    };
  }, [prop.worldContext.activeState, updateCameraPosition, cameraOption, setCameraOption]);
  const frameCallback = useCallback(
    (state: any) => {
      propWithCamera.state = state;
      if (!block.camera && state.camera) {
        stateManagerRef.current.checkAutoTransitions();
        effectsRef.current.update(state.delta, state.camera);
        const isBlending = blendManagerRef.current.update(state.delta, state.camera);
        if (!isBlending) {
          const currentState = stateManagerRef.current.getCurrentState();
          const control = prop.worldContext.mode?.control || currentState?.type || 'thirdPerson';
          if (lastModeControlRef.current !== control) {
            lastModeControlRef.current = control;
          }
          const controller = controllerMap[control as keyof typeof controllerMap] || thirdPerson;
          const mergedActiveState = {
            ...prop.worldContext.activeState,
            ...lastActiveStateRef.current,
          };
          const propWithDelta = {
            ...propWithCamera,
            worldContext: {
              ...propWithCamera.worldContext,
              activeState: mergedActiveState,
            },
            state: { ...state, delta: state.delta || 0.016 },
          };
          controller(propWithDelta);
          if (state.scene && (prop.worldContext.activeState as any)?.mesh) {
            const targetPos = state.camera.position.clone();
            const safePos = collisionSystemRef.current.checkCollision(
              state.camera.position,
              targetPos,
              state.scene,
              [(prop.worldContext.activeState as any).mesh],
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
    [
      propWithCamera,
      block.camera,
      prop.worldContext.mode?.control,
      (prop.worldContext.activeState as any)?.mesh,
      prop.worldContext.activeState?.position,
      cameraOption.target,
    ],
  );
  useUnifiedFrame(
    `camera-${prop.worldContext.mode?.control || 'default'}`,
    frameCallback,
    1,
    !block.camera,
  );
  return {
    blendManager: blendManagerRef.current,
    collisionSystem: collisionSystemRef.current,
    stateManager: stateManagerRef.current,
    effects: effectsRef.current,
  };
}
