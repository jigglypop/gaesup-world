import * as THREE from 'three';
import { CameraOptionType } from '../../types/camera';
import { activeStateUtils } from '../../utils/camera';
import { CameraController } from './CameraController';

export class FixedController extends CameraController {
  public calculateTargetPosition(cameraOption: CameraOptionType): THREE.Vector3 {
    return cameraOption.fixedPosition || new THREE.Vector3(0, 5, 10);
  }

  public override calculateRotation(prop): THREE.Euler | undefined {
    const { cameraOption } = prop;
    return cameraOption.rotation || new THREE.Euler(-0.2, 0, 0);
  }

  public override calculateLookAt(prop): THREE.Vector3 | undefined {
    const { worldContext: { activeState }, cameraOption } = prop;
    return activeStateUtils.getCameraTarget(activeState, cameraOption);
  }

  public override shouldLerpPosition(): boolean {
    return false;
  }
}
