import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class ThirdPersonController extends BaseController {
  name = 'thirdPerson';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 15, y: 8, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: true,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const offset = activeStateUtils.calculateCameraOffset(position, {
      xDistance: state.config.distance.x,
      yDistance: state.config.distance.y,
      zDistance: state.config.distance.z,
      mode: 'thirdPerson',
    });
    return position.clone().add(offset);
  }
} 