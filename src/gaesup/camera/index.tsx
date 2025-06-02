import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { cameraPropType } from '../physics/type';
import { cameraOptionAtom, blockAtom } from '../atoms';
import thirdPerson, { makeThirdPersonCameraPosition } from './control/thirdPerson';
import thirdPersonOrbit from './control/thirdPersonOrbit';
import firstPerson from './control/firstPerson';
import topDown from './control/topDown';
import sideScroll from './control/sideScroll';

export default function Camera(prop: cameraPropType) {
  const [cameraOption, setCameraOption] = useAtom(cameraOptionAtom);
  const block = useAtomValue(blockAtom);
  
  const propWithCamera = { ...prop, cameraOption };
  
  // 초기화 시 카메라 옵션 설정
  useEffect(() => {
    if (prop.worldContext.activeState?.position) {
      setCameraOption(prev => ({
        ...prev,
        target: prop.worldContext.activeState.position,
        position: makeThirdPersonCameraPosition(
          prop.worldContext.activeState,
          prev,
        ),
      }));
    }
  }, []);
  
  // 통합 프레임 시스템 사용 (우선순위: 1 - 물리 계산 다음)
  useUnifiedFrame(
    `camera-${prop.worldContext.mode.control}`,
    (state) => {
      propWithCamera.state = state;
      
      // 카메라 컨트롤 처리
      if (!block.camera) {
        const control = prop.worldContext.mode.control;
        
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
      
      // 포커스가 아닐 때 카메라 activeState 따라가기
      if (!cameraOption.focus) {
        setCameraOption(prev => ({
          ...prev,
          target: prop.worldContext.activeState.position,
          position: makeThirdPersonCameraPosition(
            prop.worldContext.activeState,
            prev,
          ),
        }));
      }
    },
    1, // 물리 계산 다음 우선순위
    !block.camera
  );
}
