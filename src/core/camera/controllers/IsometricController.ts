import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class IsometricController extends BaseController {
  name = 'isometric';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 15, y: 15, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const angle = Math.PI / 4;
    const distance = Math.sqrt(state.config.distance.x ** 2 + state.config.distance.z ** 2);
    return new THREE.Vector3(
      position.x + Math.cos(angle) * distance,
      position.y + state.config.distance.y,
      position.z + Math.sin(angle) * distance
    );
  }
} 