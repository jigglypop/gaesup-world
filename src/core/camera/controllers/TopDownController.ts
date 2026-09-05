import * as THREE from 'three';

import { BaseController } from './BaseController';
import { CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils } from '../utils/camera';

export class TopDownController extends BaseController {
  override name = 'topDown';
  private target = new THREE.Vector3();
  private offset = new THREE.Vector3();
  private yawQuaternion = new THREE.Quaternion();
  private pitchQuaternion = new THREE.Quaternion();
  private readonly topDownXAxis = new THREE.Vector3(1, 0, 0);
  private readonly topDownYAxis = new THREE.Vector3(0, 1, 0);
  override defaultConfig: Partial<CameraConfig> = {
    distance: { x: 0, y: 20, z: 0 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: false,
  };

  override calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = activeStateUtils.getPosition(props.activeState);
    const zoom = state.config.zoom || 1;
    const offset = this.offset.set(0, state.config.distance.y * zoom, 0);
    const orbitPitch = state.config.orbitPitch ?? 0;
    const orbitYaw = state.config.orbitYaw ?? 0;

    if (orbitPitch !== 0) {
      this.pitchQuaternion.setFromAxisAngle(this.topDownXAxis, orbitPitch);
      offset.applyQuaternion(this.pitchQuaternion);
    }
    if (orbitYaw !== 0) {
      this.yawQuaternion.setFromAxisAngle(this.topDownYAxis, orbitYaw);
      offset.applyQuaternion(this.yawQuaternion);
    }

    return this.target.copy(position).add(offset);
  }
} 