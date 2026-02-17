import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class FirstPersonController extends BaseController {
  name = 'firstPerson';
  private target = new THREE.Vector3();
  private lookAt = new THREE.Vector3();
  private lookDirection = new THREE.Vector3();
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 1.7, z: 0 },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    void state;
    const position = activeStateUtils.getPosition(props.activeState);
    return this.target.set(position.x, position.y + 1.7, position.z);
  }

  override calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    void state;
    const position = activeStateUtils.getPosition(props.activeState);
    const euler = activeStateUtils.getEuler(props.activeState);
    const lookDirection = this.lookDirection.set(0, 0, -1);
    if (euler) lookDirection.applyEuler(euler);
    return this.lookAt.copy(position).add(lookDirection);
  }
} 