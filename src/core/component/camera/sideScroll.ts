import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType } from '../../types/camera';
import { cameraUtils, activeStateUtils } from '../../utils/camera';
import { CameraController } from './CameraController';
import { V3 } from '@utils/vector';

export class SideScrollController extends CameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const position = activeStateUtils.getPosition(activeState);
    const xOffset = cameraOption.xDistance || -10;
    const yOffset = cameraOption.yDistance || 5;
    
    return position.clone().add(new THREE.Vector3(xOffset, yOffset, 0));
  }

  public override calculateLookAt(prop: any): THREE.Vector3 | undefined {
    const { worldContext: { activeState }, cameraOption } = prop;
    return activeStateUtils.getCameraTarget(activeState, cameraOption);
  }

  public override shouldLerpPosition(): boolean {
    return true;
  }
}
