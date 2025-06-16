import * as THREE from 'three';
import { ActiveStateType, CameraOptionType, gaesupWorldContextType } from '../../../types';
import { CameraPropType } from '../../types';
import { cameraUtils } from '../utils';
import { BaseCameraController } from './BaseCameraController';

const tempVector3 = new THREE.Vector3();
const tempVector3_2 = new THREE.Vector3();
const tempDirection = new THREE.Vector3();

export default function thirdPerson(prop: CameraPropType) {
  const {
    state,
    worldContext: { activeState },
    cameraOption,
  } = prop;

  if (!state?.camera || !activeState) return;

  let currentPosition: THREE.Vector3;
  if (activeState.position instanceof THREE.Vector3) {
    currentPosition = activeState.position;
  } else if (activeState.position && typeof activeState.position === 'object') {
    tempVector3.set(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0,
    );
    currentPosition = tempVector3;
  } else {
    currentPosition = new THREE.Vector3(0, 0, 0);
  }

  const xDist = cameraOption.xDistance ?? 15;
  const yDist = cameraOption.yDistance ?? 8;
  const zDist = cameraOption.zDistance ?? 15;

  const worldOffset = new THREE.Vector3(-xDist, yDist, -zDist);
  const targetPosition = tempVector3_2.copy(currentPosition).add(worldOffset);

  if (cameraOption.bounds) {
    cameraUtils.clampPosition(targetPosition, cameraOption.bounds);
  }

  const deltaTime = prop.state?.delta || 0.016;
  const lookAtTarget = cameraOption.target || currentPosition;

  cameraUtils.preventCameraJitter(state.camera, targetPosition, lookAtTarget, 8.0, deltaTime);

  if (cameraOption.fov && state.camera instanceof THREE.PerspectiveCamera) {
    cameraUtils.updateFOV(state.camera, cameraOption.fov, cameraOption.smoothing?.fov);
  }
}

export class ThirdPersonController extends BaseCameraController {
  public calculateTargetPosition(
    activeState: ActiveStateType,
    camera: THREE.Camera,
    cameraOption: CameraOptionType,
  ): THREE.Vector3 {
    if (!activeState.position) {
      return camera.position;
    }

    const characterPosition = new THREE.Vector3(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0,
    );

    const offset = new THREE.Vector3(
      -(cameraOption.xDistance ?? 15),
      cameraOption.yDistance ?? 8,
      -(cameraOption.zDistance ?? 15),
    );

    return characterPosition.clone().add(offset);
  }

  public override calculateLookAt(prop: CameraPropType): THREE.Vector3 | undefined {
    const {
      worldContext: { activeState },
    } = prop;

    if (!activeState?.position) {
      return undefined;
    }

    return new THREE.Vector3(
      activeState.position.x || 0,
      activeState.position.y || 0,
      activeState.position.z || 0,
    );
  }
}
