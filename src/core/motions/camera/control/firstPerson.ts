import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../../types';
import { CameraPropType } from '../../types';
import { V3 } from '@utils/vector';
import { BaseCameraController } from './BaseCameraController';

const tempForward = new THREE.Vector3(0, 0, -1);
const tempLookAt = new THREE.Vector3();

export class FirstPersonController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const yOffset = cameraOption.yDistance ?? 1.6;
    const characterPosition = activeState.position
      ? V3(activeState.position.x, activeState.position.y, activeState.position.z)
      : V3(0, 0, 0);
    return characterPosition.add(V3(0, yOffset, 0));
  }

  private calculateLookAt(
    cameraPosition: THREE.Vector3,
    activeState: ActiveStateType,
  ): THREE.Vector3 {
    tempForward.set(0, 0, -1);
    if (activeState.euler) {
      tempForward.applyEuler(activeState.euler);
    }
    return tempLookAt.copy(cameraPosition).add(tempForward.multiplyScalar(10));
  }

  private applyHeadBobbing(
    camera: THREE.Camera,
    activeState: ActiveStateType,
    time: number,
    intensity: number = 0.05,
  ) {
    if (!activeState.velocity) return;
    const velocity = activeState.velocity.length();
    if (velocity > 0.1) {
      const bobbing = Math.sin(time * 8) * intensity * velocity * 0.1;
      camera.position.y += bobbing;
    }
  }

  public override update(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
      cameraOption,
    } = prop;
    if (!state?.camera || !activeState || !activeState.position) return;

    const targetPosition = this.calculateTargetPosition(activeState, cameraOption);
    const lerpSpeed = cameraOption.smoothing?.position;
    state.camera.position.lerp(targetPosition, lerpSpeed);
    const lookAt = this.calculateLookAt(state.camera.position, activeState);
    state.camera.lookAt(lookAt);

    this.applyHeadBobbing(state.camera, activeState, Date.now() / 1000);

    if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
      const fovLerpSpeed = cameraOption.smoothing?.fov ?? 0.1;
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, cameraOption.fov, fovLerpSpeed);
      state.camera.updateProjectionMatrix();
    }
  }
}
