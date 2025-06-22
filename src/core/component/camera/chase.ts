import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { cameraUtils } from '../../utils/camera';
import { BaseCameraController } from './BaseCameraController';

export class ChaseController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    if (!activeState.position || !activeState.euler) return camera.position;

    const xDistance = cameraOption.xDistance ?? 15;
    const yDistance = cameraOption.yDistance ?? 8;
    const zDistance = cameraOption.zDistance ?? 15;

    const characterPosition = new THREE.Vector3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );
    const offsetDirection = new THREE.Vector3(
      Math.sin(activeState.euler.y),
      1,
      Math.cos(activeState.euler.y)
    ).normalize();
    const offset = offsetDirection.clone().multiply(
      new THREE.Vector3(-xDistance, yDistance, -zDistance)
    );
    const targetPosition = characterPosition.clone().add(offset);
    if (cameraOption.bounds) {
      cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
    }
    return targetPosition;
  }

  public override calculateLookAt(prop: any): THREE.Vector3 | undefined {
    const { worldContext: { activeState } } = prop;
    if (!activeState?.position) return undefined;
    return new THREE.Vector3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );
  }

  public override afterUpdate(prop: any): void {
    const { state, worldContext: { activeState } } = prop;
    
    if (!state?.camera || !activeState?.position) return;

    const lookAtTarget = new THREE.Vector3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );

    state.camera.lookAt(lookAtTarget);
  }

  public override shouldLerpPosition(): boolean {
    return true;
  }
}
