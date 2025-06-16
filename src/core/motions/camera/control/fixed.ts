import * as THREE from 'three';
import { CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { BaseCameraController } from './BaseCameraController';

export class FixedController extends BaseCameraController {
  public calculateTargetPosition(cameraOption: CameraOptionType): THREE.Vector3 {
    return cameraOption.fixedPosition || new THREE.Vector3();
  }

  public override shouldLerpPosition(): boolean {
    return false;
  }

  public override calculateRotation(prop: CameraPropType): THREE.Euler | undefined {
    return prop.cameraOption.rotation;
  }
}
