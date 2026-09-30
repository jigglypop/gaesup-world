import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CAMERA_DEFAULTS } from '../core/constants';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class FirstPersonController extends BaseController {
  name = 'firstPerson';
  private target = new THREE.Vector3();
  private lookAt = new THREE.Vector3();
  private lookDirection = new THREE.Vector3();
  private eyePosition = new THREE.Vector3();
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: CAMERA_DEFAULTS.FIRST_PERSON_EYE_HEIGHT, z: CAMERA_DEFAULTS.FIRST_PERSON_FORWARD },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const euler = activeStateUtils.getEuler(props.activeState);
    const eyeHeight = state.config.distance.y || CAMERA_DEFAULTS.FIRST_PERSON_EYE_HEIGHT;
    const forwardOffset = state.config.distance.z || CAMERA_DEFAULTS.FIRST_PERSON_FORWARD;
    const lookDirection = this.lookDirection.set(0, 0, -1);
    if (euler) lookDirection.applyEuler(euler);

    return this.target
      .set(position.x, position.y + eyeHeight, position.z)
      .addScaledVector(lookDirection, forwardOffset);
  }

  override calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = this.eyePosition.copy(this.calculateTargetPosition(props, state));
    const euler = activeStateUtils.getEuler(props.activeState);
    const lookDirection = this.lookDirection.set(0, 0, -1);
    if (euler) lookDirection.applyEuler(euler);
    return this.lookAt.copy(position).add(lookDirection);
  }
} 