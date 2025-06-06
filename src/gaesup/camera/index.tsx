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

const THROTTLE_MS = 16;
const POSITION_THRESHOLD = 0.001;
const TARGET_THRESHOLD = 0.001;

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
      
      console.log('CAMERA DEBUG - updateCameraPosition called, mode:', currentMode);
      
      if (currentMode === 'thirdPersonOrbit' || currentMode === 'orbit') {
        console.log('CAMERA DEBUG - skipping updateCameraPosition for orbit mode');
        return;
      }
      
      const now = performance.now();
      if (!force && now - throttleTimeRef.current < THROTTLE_MS) return;
      throttleTimeRef.current = now;
      
      if (!activeState?.position) return;
      
      const currentOption = cameraOptionRef.current;
      const newPosition = makeThirdPersonCameraPosition(activeState, currentOption);
      const newTarget = activeState.position;
      
      if (!newTarget || !newPosition) return;

      const lastPos = lastPositionRef.current;
      const lastTar = lastTargetRef.current;
      
      const positionChanged = !lastPos || 
        Math.abs(newPosition.x - lastPos.x) > POSITION_THRESHOLD ||
        Math.abs(newPosition.y - lastPos.y) > POSITION_THRESHOLD ||
        Math.abs(newPosition.z - lastPos.z) > POSITION_THRESHOLD;
      
      const targetChanged = !lastTar ||
        Math.abs(newTarget.x - lastTar.x) > TARGET_THRESHOLD ||
        Math.abs(newTarget.y - lastTar.y) > TARGET_THRESHOLD ||
        Math.abs(newTarget.z - lastTar.z) > TARGET_THRESHOLD;

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
      
      console.log('CAMERA DEBUG - frameCallback called:', {
        blockCamera: block.camera,
        hasCamera: !!state.camera,
        mode: prop.worldContext.mode?.control
      });
      
      if (!block.camera && state.camera) {
        const control = prop.worldContext.mode?.control || 'thirdPerson';
        
        console.log('CAMERA DEBUG - executing camera control:', control);
        
        if (lastModeControlRef.current !== control) {
          lastModeControlRef.current = control;
          console.log('CAMERA DEBUG - mode changed to:', control);
        }

        const controller = controllerMap[control as keyof typeof controllerMap] || thirdPerson;
        
        console.log('CAMERA DEBUG - calling controller:', controller.name || 'unknown');
        
        controller(propWithCamera);
      }
    },
    [propWithCamera, block.camera, prop.worldContext.mode?.control],
  );

  useUnifiedFrame(`camera-${prop.worldContext.mode?.control || 'default'}`, frameCallback, 1, !block.camera);
}
