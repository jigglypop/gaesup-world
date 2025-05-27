import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { cameraPropType } from '../physics/type';
import normal, { makeNormalCameraPosition } from './control/normal';
import orbit from './control/orbit';

export default function Camera(prop: cameraPropType) {
  // 통합 프레임 시스템 사용 (우선순위: 1 - 물리 계산 다음)
  useUnifiedFrame(
    `camera-${prop.worldContext.mode.control}`,
    (state) => {
      prop.state = state;
      
      // 카메라 컨트롤 처리
      if (!prop.worldContext.block.camera) {
        if (prop.worldContext.mode.control === 'orbit') {
          orbit(prop);
        } else if (prop.worldContext.mode.control === 'normal') {
          normal(prop);
        }
      }
      
      // 포커스가 아닐 때 카메라 activeState 따라가기
      if (!prop.worldContext.cameraOption.focus) {
        prop.worldContext.cameraOption.target = prop.worldContext.activeState.position;
        prop.worldContext.cameraOption.position = makeNormalCameraPosition(
          prop.worldContext.activeState,
          prop.worldContext.cameraOption,
        );
      }
    },
    1, // 물리 계산 다음 우선순위
    !prop.worldContext.block.camera
  );
}
