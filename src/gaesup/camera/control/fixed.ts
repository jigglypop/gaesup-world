import * as THREE from 'three';
import { CameraPropType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';

export class FixedController extends BaseCameraController {
  // calculateTargetPosition is not strictly needed for a fixed camera,
  // but we must implement it. Return the fixed position.
  public calculateTargetPosition(activeState: any, cameraOption: any): THREE.Vector3 {
    return cameraOption.fixedPosition || new THREE.Vector3();
  }

  public override update(prop: CameraPropType): void {
    const { state, cameraOption } = prop;
    if (!state?.camera || !cameraOption.fixedPosition) return;

    // For fixed camera, we don't lerp, we set directly.
    state.camera.position.copy(cameraOption.fixedPosition);

    if (cameraOption.target) {
      state.camera.lookAt(cameraOption.target);
    } else if (cameraOption.rotation) {
      state.camera.rotation.copy(cameraOption.rotation);
    }
  }
}
