import * as THREE from 'three';
import { ActiveStateType } from '../../types';
import { CameraOptionType } from '../../types/camera';
import { cameraUtils, activeStateUtils } from '../../utils/camera';
import { CameraController } from './CameraController';

export class ChaseController extends CameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const position = activeStateUtils.getPosition(activeState);
    const euler = activeStateUtils.getEuler(activeState);
    
    const offset = activeStateUtils.calculateCameraOffset(position, {
      xDistance: cameraOption.xDistance,
      yDistance: cameraOption.yDistance,
      zDistance: cameraOption.zDistance,
      euler,
      mode: 'chase',
    });

    const targetPosition = position.clone().add(offset);
    
    if (cameraOption.bounds) {
      cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }
    
    return targetPosition;
  }

  public override calculateLookAt(prop: any): THREE.Vector3 | undefined {
    const { worldContext: { activeState }, cameraOption } = prop;
    return activeStateUtils.getCameraTarget(activeState, cameraOption);
  }

  public override afterUpdate(prop: any): void {
    const { state, worldContext: { activeState }, cameraOption } = prop;
    
    if (!state?.camera) return;

    const lookAtTarget = activeStateUtils.getCameraTarget(activeState, cameraOption);
    state.camera.lookAt(lookAtTarget);
  }

  public override shouldLerpPosition(): boolean {
    return true;
  }
}
