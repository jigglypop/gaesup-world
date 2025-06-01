import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { cameraPropType } from '../physics/type';
import thirdPerson, { makeThirdPersonCameraPosition } from './control/thirdPerson';
import thirdPersonOrbit from './control/thirdPersonOrbit';
import firstPerson from './control/firstPerson';
import topDown from './control/topDown';
import sideScroll from './control/sideScroll';

export default function Camera(prop: cameraPropType) {
  // 통합 프레임 시스템 사용 (우선순위: 1 - 물리 계산 다음)
  useUnifiedFrame(
    `camera-${prop.worldContext.mode.control}`,
    (state) => {
      prop.state = state;
      
      // 카메라 컨트롤 처리
      if (!prop.worldContext.block.camera) {
        const control = prop.worldContext.mode.control;
        
        switch (control) {
          case 'firstPerson':
            firstPerson(prop);
            break;
          case 'thirdPerson':
          case 'normal':
            thirdPerson(prop);
            break;
          case 'thirdPersonOrbit':
          case 'orbit':
            thirdPersonOrbit(prop);
            break;
          case 'topDown':
            topDown(prop);
            break;
          case 'sideScroll':
            sideScroll(prop);
            break;
          default:
            thirdPerson(prop);
            break;
        }
      }
      
      // 포커스가 아닐 때 카메라 activeState 따라가기
      if (!prop.worldContext.cameraOption.focus) {
        prop.worldContext.cameraOption.target = prop.worldContext.activeState.position;
        prop.worldContext.cameraOption.position = makeThirdPersonCameraPosition(
          prop.worldContext.activeState,
          prop.worldContext.cameraOption,
        );
      }
    },
    1, // 물리 계산 다음 우선순위
    !prop.worldContext.block.camera
  );
}
