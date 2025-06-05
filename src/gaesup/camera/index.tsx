import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
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

export default function Camera(prop: CameraPropType) {
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const block = useAtomValue(blockAtom);
  const propWithCamera = { ...prop, cameraOption };
  const cameraOptionRef = useRef(cameraOption);
  const lastModeControlRef = useRef<string | null>(null);
  const lastActiveStateRef = useRef<Partial<gaesupWorldContextType['activeState']> | null>(null);
  const throttleTimeRef = useRef(0);
  cameraOptionRef.current = cameraOption;
  const updateCameraPosition = useCallback(
    (activeState: gaesupWorldContextType['activeState'], force = false) => {
      const now = performance.now();
      if (!force && now - throttleTimeRef.current < 16) return;
      throttleTimeRef.current = now;
      if (!activeState?.position) return;
      const currentOption = cameraOptionRef.current;
      const newPosition = makeThirdPersonCameraPosition(activeState, currentOption);
      const newTarget = activeState.position;
      if (!newTarget || !newPosition) return;
      const positionChanged = currentOption.position
        ? !newPosition.equals(currentOption.position)
        : true;
      const targetChanged = currentOption.target ? !newTarget.equals(currentOption.target) : true;

      if (positionChanged || targetChanged) {
        setCameraOption((prev) => ({
          ...prev,
          target: newTarget.clone(),
          position: newPosition.clone(),
        }));
      }
    },
    [setCameraOption],
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
      const activeState = {
        ...prop.worldContext.activeState,
        euler: data.euler,
        direction: data.direction,
      };
      lastActiveStateRef.current = activeState;
    });

    return () => {
      unsubscribePosition();
      unsubscribeRotation();
    };
  }, [prop.worldContext.activeState, updateCameraPosition]);

  useUnifiedFrame(
    `camera-${prop.worldContext.mode?.control || 'default'}`,
    (state) => {
      propWithCamera.state = state;

      if (!block.camera && state.camera) {
        const control = prop.worldContext.mode?.control || 'thirdPerson';

        if (lastModeControlRef.current !== control) {
          lastModeControlRef.current = control;
        }

        switch (control) {
          case 'firstPerson':
            firstPerson(propWithCamera);
            break;
          case 'thirdPerson':
          case 'normal':
            thirdPerson(propWithCamera);
            break;
          case 'thirdPersonOrbit':
          case 'orbit':
            thirdPersonOrbit(propWithCamera);
            break;
          case 'topDown':
            topDown(propWithCamera);
            break;
          case 'sideScroll':
            sideScroll(propWithCamera);
            break;
          default:
            thirdPerson(propWithCamera);
            break;
        }
      }
    },
    1,
    !block.camera,
  );
}
