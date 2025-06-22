import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { V3 } from '@utils/vector';
import { BaseCameraController } from './BaseCameraController';

export class IsometricController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const distance = cameraOption.distance ?? 20;
    const angle = cameraOption.isoAngle ?? Math.PI / 4;

    if (!activeState.position) return camera.position;

    const characterPosition = V3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );

    return new THREE.Vector3(
      characterPosition.x + distance * Math.cos(angle),
      characterPosition.y + distance,
      characterPosition.z + distance * Math.sin(angle),
    );
  }
}
