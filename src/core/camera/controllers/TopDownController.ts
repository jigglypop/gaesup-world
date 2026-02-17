import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class TopDownController extends BaseController {
  name = 'topDown';
  private target = new THREE.Vector3();
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 20, z: 0 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    return this.target.set(position.x, position.y + state.config.distance.y, position.z);
  }
} 