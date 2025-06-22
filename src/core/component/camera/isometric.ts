import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType } from '../../types/camera';
import { cameraUtils, activeStateUtils } from '../../utils/camera';
import { V3 } from '@utils/vector';
import { CameraController } from './CameraController';

export class IsometricController extends CameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const position = activeStateUtils.getPosition(activeState);
    const distance = cameraOption.distance || 15;
    const angle = cameraOption.isoAngle || Math.PI / 4;
    
    const offset = new THREE.Vector3(
      Math.cos(angle) * distance,
      distance * 0.8,
      Math.sin(angle) * distance
    );
    
    return position.clone().add(offset);
  }

  public override calculateLookAt(prop: any): THREE.Vector3 | undefined {
    const { worldContext: { activeState }, cameraOption } = prop;
    return activeStateUtils.getCameraTarget(activeState, cameraOption);
  }

  public override shouldLerpPosition(): boolean {
    return true;
  }
}
