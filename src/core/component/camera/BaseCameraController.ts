import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { CameraPropType } from '../../types/camera';
import { cameraUtils } from '../../utils/camera';

export abstract class BaseCameraController {
  protected tempVector = new THREE.Vector3();
  abstract calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3;

  calculateLookAt(prop: CameraPropType): THREE.Vector3 | undefined {
    return prop.cameraOption.target;
  }

  calculateRotation(prop: CameraPropType): THREE.Euler | undefined {
    return undefined;
  }

  shouldLerpPosition(): boolean {
    return true;
  }

  afterUpdate(prop: CameraPropType): void {
  }

  update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
      cameraOption,
    } = prop;
    if (!state?.camera) return;
    if (!activeState) return;

    const targetPosition = this.calculateTargetPosition(activeState, state.camera, cameraOption);
    const lookAtTarget = this.calculateLookAt(prop);
    const rotation = this.calculateRotation(prop);
    const deltaTime = state.delta || 0.016;

    if (this.shouldLerpPosition() && lookAtTarget) {
      cameraUtils.preventCameraJitter(state.camera, targetPosition, lookAtTarget, 8.0, deltaTime);
    } else if (this.shouldLerpPosition()) {
      const lerpSpeed = cameraOption.smoothing?.position ?? 0.1;
      const factor = 1 - Math.exp(-8.0 * deltaTime);
      state.camera.position.lerp(targetPosition, factor);
    } else {
      state.camera.position.copy(targetPosition);
      if (rotation) {
        state.camera.rotation.copy(rotation);
      }
    }

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
    }
    if (state.camera instanceof THREE.OrthographicCamera) {
      const zoom = cameraOption.zoom || 1;
      const factor = 1 - Math.exp(-8.0 * deltaTime);
      state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, zoom, factor);
      state.camera.updateProjectionMatrix();
    }
    this.afterUpdate(prop);
  }
} 