import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '@utils/vector';
import { cameraUtils } from '../utils';

export class TopDownController extends BaseCameraController {
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

    const height = Math.abs(cameraOption.yDistance ?? 20);
    const xOffset = cameraOption.xDistance ?? 0;
    const zOffset = cameraOption.zDistance ?? 0;

    let targetPosition = characterPosition.clone().add(V3(xOffset, height, zOffset));

    if (cameraOption.bounds) {
      targetPosition = cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }

    return targetPosition;
  }
}
