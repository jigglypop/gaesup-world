import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class SideScrollController extends BaseController {
  name = 'sideScroll';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 5, z: 10 },
    smoothing: { position: 0.08, rotation: 0.1, fov: 0.1 },
    enableCollision: false,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    return new THREE.Vector3(
      position.x + state.config.distance.x,
      position.y + state.config.distance.y,
      state.config.distance.z
    );
  }
} 