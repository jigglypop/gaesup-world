import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, CameraPropType } from '../../../types';
import { BaseCameraController } from './BaseCameraController';
import { V3 } from '../../utils/vector';

export class IsometricController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const distance = cameraOption.distance ?? 20;
    const angle = cameraOption.isoAngle ?? Math.PI / 4;

    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);

    return new THREE.Vector3(
      characterPosition.x + distance * Math.cos(angle),
      characterPosition.y + distance,
      characterPosition.z + distance * Math.sin(angle),
    );
  }

  public override update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
      cameraOption,
    } = prop;

    if (!state?.camera || !activeState?.position) return;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption);

    const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;
    state.camera.position.lerp(targetPosition, lerpSpeed);
    state.camera.lookAt(activeState.position);

    if (state.camera instanceof THREE.OrthographicCamera) {
      const zoom = cameraOption.zoom || 1;
      state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, zoom, lerpSpeed);
      state.camera.updateProjectionMatrix();
    }
  }
}
