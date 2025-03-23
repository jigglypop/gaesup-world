import { useFrame } from '@react-three/fiber';
import { cameraPropType } from '../physics/type';
import normal, { makeNormalCameraPosition } from './control/normal';
import orbit from './control/orbit';

export default function Camera(prop: cameraPropType) {
  useFrame((state) => {
    prop.state = state;
    if (!prop.worldContext.block.camera) {
      if (prop.worldContext.mode.control === 'orbit') {
        orbit(prop);
      } else if (prop.worldContext.mode.control === 'normal') {
        normal(prop);
      }
    }
  });
  // 포커스가 아닐 때 카메라 activeStae 따라가기
  useFrame(() => {
    if (!prop.worldContext.cameraOption.focus) {
      prop.worldContext.cameraOption.target = prop.worldContext.activeState.position;
      prop.worldContext.cameraOption.position = makeNormalCameraPosition(
        prop.worldContext.activeState,
        prop.worldContext.cameraOption,
      );
    }
  });
}
