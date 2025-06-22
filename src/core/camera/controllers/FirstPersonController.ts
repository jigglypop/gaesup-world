import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../../utils/camera';

export class FirstPersonController extends BaseController {
  name = 'firstPerson';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 1.7, z: 0 },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const headOffset = new THREE.Vector3(0, 1.7, 0);
    return position.clone().add(headOffset);
  }

  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const euler = activeStateUtils.getEuler(props.activeState);
    const lookDirection = new THREE.Vector3(0, 0, -1);
    if (euler) {
      lookDirection.applyEuler(euler);
    }
    return position.clone().add(lookDirection);
  }
} 