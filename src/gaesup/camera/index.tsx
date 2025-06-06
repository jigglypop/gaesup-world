import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { blockAtom, cameraOptionAtom } from '../atoms';
import { gaesupWorldContextType } from '../context';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { physicsEventBus } from '../physics/stores/physicsEventBus';
import { CameraBlendManager } from './blend/CameraBlendManager';
import { SmartCollisionSystem } from './collision/SmartCollisionSystem';
import firstPerson from './control/firstPerson';
import fixed from './control/fixed';
import isometric from './control/isometric';
import shoulder from './control/shoulder';
import sideScroll from './control/sideScroll';
import thirdPerson, { makeThirdPersonCameraPosition } from './control/thirdPerson';
import thirdPersonOrbit from './control/thirdPersonOrbit';
import topDown from './control/topDown';
import { CameraEffects } from './effects/CameraEffects';
import { CameraStateManager } from './state/CameraStateManager';
import { CameraPropType } from './type';
import { CAMERA_CONSTANTS, cameraUtils } from './utils';

const controllerMap = {
  firstPerson,
  thirdPerson,
  normal: thirdPerson,
  thirdPersonOrbit,
  orbit: thirdPersonOrbit,
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
      if (currentMode === 'thirdPersonOrbit' || currentMode === 'orbit') {
        return;
      }
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
        setCameraOption((prev: any) => ({
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
    const unsubscribePosition = physicsEventBus.subscribe('POSITION_UPDATE', (data) => {
      const activeState = {
        position: data.position,
        velocity: data.velocity,
        ...prop.worldContext.activeState,
      } as gaesupWorldContextType['activeState'];
      updateCameraPosition(activeState);
    });

    const unsubscribeRotation = physicsEventBus.subscribe('ROTATION_UPDATE', (data) => {
      lastActiveStateRef.current = {
        ...prop.worldContext.activeState,
        euler: data.euler,
        direction: data.direction,
      };
    });

    return () => {
      unsubscribePosition();
      unsubscribeRotation();
    };
  }, [prop.worldContext.activeState, updateCameraPosition]);

  const frameCallback = useCallback(
    (state: any) => {
      propWithCamera.state = state;
      if (!block.camera && state.camera) {
        stateManagerRef.current.checkAutoTransitions();
        effectsRef.current.update(state.delta, state.camera);

        const isBlending = blendManagerRef.current.update(state.delta, state.camera);

        if (!isBlending) {
          const currentState = stateManagerRef.current.getCurrentState();
          const control = currentState?.type || prop.worldContext.mode?.control || 'thirdPerson';

          if (lastModeControlRef.current !== control) {
            lastModeControlRef.current = control;
          }

          const controller = controllerMap[control as keyof typeof controllerMap] || thirdPerson;
          const propWithDelta = {
            ...propWithCamera,
            state: { ...state, delta: state.delta || 0.016 },
          };
          controller(propWithDelta);

          if (state.scene && prop.worldContext.activeState?.mesh) {
            const targetPos = state.camera.position.clone();
            const safePos = collisionSystemRef.current.checkCollision(
              state.camera.position,
              targetPos,
              state.scene,
              [prop.worldContext.activeState.mesh],
            );
            state.camera.position.copy(safePos);
          }
        }
      }
    },
    [
      propWithCamera,
      block.camera,
      prop.worldContext.mode?.control,
      prop.worldContext.activeState?.mesh,
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
