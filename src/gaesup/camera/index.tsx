import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { blockAtom, cameraOptionAtom } from '../atoms';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { physicsEventBus } from '../physics/stores/physicsEventBus';
import { gaesupWorldContextType } from '../world/context/type';
import firstPerson from './control/firstPerson';
import sideScroll from './control/sideScroll';
import thirdPerson, { makeThirdPersonCameraPosition } from './control/thirdPerson';
import thirdPersonOrbit from './control/thirdPersonOrbit';
import topDown from './control/topDown';
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
      const positionChanged = !lastPos || 
        !cameraUtils.isPositionEqual(newPosition, lastPos, CAMERA_CONSTANTS.POSITION_THRESHOLD);
      const targetChanged = !lastTar ||
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
        const control = prop.worldContext.mode?.control || 'thirdPerson';
        if (lastModeControlRef.current !== control) {
          lastModeControlRef.current = control;
        }
        const controller = controllerMap[control as keyof typeof controllerMap] || thirdPerson;
        controller(propWithCamera);
      }
    },
    [propWithCamera, block.camera, prop.worldContext.mode?.control],
  );

  useUnifiedFrame(`camera-${prop.worldContext.mode?.control || 'default'}`, frameCallback, 1, !block.camera);
}
