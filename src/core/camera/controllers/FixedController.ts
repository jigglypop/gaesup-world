import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';

export class FixedController extends BaseController {
  name = 'fixed';
  private defaultPosition = new THREE.Vector3(0, 10, 10);
  private defaultLookAt = new THREE.Vector3(0, 0, 0);
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 0, z: 0 },
    smoothing: { position: 0, rotation: 0, fov: 0 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    void props;
    return state.config.fixedPosition || this.defaultPosition;
  }

  override calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    void props;
    return state.config.fixedLookAt || this.defaultLookAt;
  }
} 