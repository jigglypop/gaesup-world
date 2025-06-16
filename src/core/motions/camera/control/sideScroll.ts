import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '@utils/vector';
import { cameraUtils } from '../utils';

export class SideScrollController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    if (!activeState.position) return camera.position;

    const characterPosition = V3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );
    const xOffset = cameraOption.xDistance;
    const yOffset = cameraOption.yDistance;
    const zFollow = characterPosition.z;
    let targetPosition = V3(characterPosition.x + xOffset, characterPosition.y + yOffset, zFollow);
    if (cameraOption.bounds) {
      targetPosition = cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }
    return targetPosition;
  }
}
