import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class FirstPersonController extends BaseController {
  name = 'firstPerson';
  private target = new THREE.Vector3();
  private lookAt = new THREE.Vector3();
  private lookDirection = new THREE.Vector3();
  private eyePosition = new THREE.Vector3();
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 2.0, z: 0.45 },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const euler = activeStateUtils.getEuler(props.activeState);
    const eyeHeight = state.config.distance.y || this.defaultConfig.distance?.y || 2.0;
    const forwardOffset = state.config.distance.z || this.defaultConfig.distance?.z || 0.45;
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