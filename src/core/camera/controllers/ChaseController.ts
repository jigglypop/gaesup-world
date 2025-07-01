import * as THREE from 'three';
import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class ChaseController extends BaseController {
  name = 'chase';
  defaultConfig: Partial<CameraConfig> = {
    distance: { x: 10, y: 5, z: 10 },
    smoothing: { position: 0.15, rotation: 0.1, fov: 0.1 },
    enableCollision: true,
  };

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const euler = activeStateUtils.getEuler(props.activeState);
    const zoom = state.config.zoom || -1;
    const offset = activeStateUtils.calculateCameraOffset(position, {
      xDistance: state.config.distance.x * zoom,
      yDistance: state.config.distance.y * zoom,
      zDistance: state.config.distance.z * zoom,
      euler,
      mode: 'chase',
    });
    return position.clone().add(offset);
  }
} 