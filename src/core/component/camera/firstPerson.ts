import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType } from '../../types/camera';
import { cameraUtils, activeStateUtils } from '../../utils/camera';
import { V3 } from '@utils/vector';
import { CameraController } from './CameraController';

const tempForward = new THREE.Vector3(0, 0, -1);

export class FirstPersonController extends CameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const position = activeStateUtils.getPosition(activeState);
    const headOffset = new THREE.Vector3(0, cameraOption.yDistance || 1.8, 0);
    return position.clone().add(headOffset);
  }

  public override calculateLookAt(prop): THREE.Vector3 {
    const { worldContext: { activeState } } = prop;
    const position = activeStateUtils.getPosition(activeState);
    const euler = activeStateUtils.getEuler(activeState);
    const lookDirection = tempForward.clone();
    if (euler) {
      lookDirection.applyEuler(euler);
    }
    return position.clone().add(lookDirection);
  }

  public override afterUpdate(prop): void {
    const { worldContext: { activeState } } = prop;
    const velocity = activeStateUtils.getVelocity(activeState);
    const speed = velocity.length();
  }

  public override shouldLerpPosition(): boolean {
    return false;
  }
}
