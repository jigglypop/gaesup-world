import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class ThirdPersonController extends BaseController {
  name = 'thirdPerson';
  private target = new THREE.Vector3();
  private offset = new THREE.Vector3();
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 15, y: 8, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: true,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const zoom = state.config.zoom || 1;
    activeStateUtils.calculateCameraOffset(position, {
      xDistance: state.config.distance.x * zoom,
      yDistance: state.config.distance.y * zoom,
      zDistance: state.config.distance.z * zoom,
      mode: 'thirdPerson',
    }, this.offset);
    return this.target.copy(position).add(this.offset);
  }
} 