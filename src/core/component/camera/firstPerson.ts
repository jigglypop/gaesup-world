import * as THREE from 'three';
import { ActiveStateType, CameraOptionType } from '../../types';
import { CameraPropType } from '../../types/camera';
import { V3 } from '@utils/vector';
import { BaseCameraController } from './BaseCameraController';

const tempForward = new THREE.Vector3(0, 0, -1);
const tempLookAt = new THREE.Vector3();

export class FirstPersonController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    const yOffset = cameraOption.yDistance ?? 1.6;
    if (!activeState.position) return camera.position;
    const characterPosition = V3(
      activeState.position.x,
      activeState.position.y,
      activeState.position.z,
    );
    return characterPosition.add(V3(0, yOffset, 0));
  }

  public override calculateLookAt(prop: CameraPropType): THREE.Vector3 {
    const {
      state,
      worldContext: { activeState },
    } = prop;
    tempForward.set(0, 0, -1);
    if (activeState.euler) {
      tempForward.applyEuler(activeState.euler);
    }
    return tempLookAt.copy(state.camera.position).add(tempForward.multiplyScalar(10));
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

  public override afterUpdate(prop: CameraPropType): void {
    const {
      state,
      worldContext: { activeState },
    } = prop;
    if (!state?.camera) return;
    this.applyHeadBobbing(state.camera, activeState, Date.now() / 1000);
  }
}
