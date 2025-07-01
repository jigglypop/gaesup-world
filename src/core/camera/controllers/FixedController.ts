import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';

export class FixedController extends BaseController {
  name = 'fixed';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 0, z: 0 },
    smoothing: { position: 0, rotation: 0, fov: 0 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    return state.config.fixedPosition || new THREE.Vector3(0, 10, 10);
  }

  overridecalculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    return state.config.fixedLookAt || new THREE.Vector3(0, 0, 0);
  }
} 