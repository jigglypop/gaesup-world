import * as THREE from 'three';

import { Profile, HandleError } from '@/core/boilerplate/decorators';

import { ICameraController, CameraCalcProps, CameraSystemState, CameraSystemConfig } from '../core/types';
import { activeStateUtils, cameraUtils } from '../utils/camera';

export abstract class BaseController implements ICameraController {
  abstract name: string;
  abstract defaultConfig: Partial<CameraSystemConfig>;
  abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;

  // Scratch objects reused per controller instance (one instance per CameraSystem).
  private focusTarget = new THREE.Vector3();
  private focusDirection = new THREE.Vector3();
  private focusTargetPosition = new THREE.Vector3();

  private applyDefaults(state: CameraSystemState): void {
    const defaults = this.defaultConfig;
    const cfg = state.config;

    // Only fill missing fields; do not overwrite runtime config updated by the store.
    if (defaults.enableCollision !== undefined && cfg.enableCollision === undefined) {
      cfg.enableCollision = defaults.enableCollision;
    }

    if (defaults.distance) {
      const d = cfg.distance;
      if (!d) {
        cfg.distance = { ...defaults.distance };
      } else {
        if (d.x === undefined && defaults.distance.x !== undefined) d.x = defaults.distance.x;
        if (d.y === undefined && defaults.distance.y !== undefined) d.y = defaults.distance.y;
        if (d.z === undefined && defaults.distance.z !== undefined) d.z = defaults.distance.z;
      }
    }

    if (defaults.smoothing) {
      const s = cfg.smoothing;
      if (!s) {
        cfg.smoothing = { ...defaults.smoothing };
      } else {
        if (s.position === undefined && defaults.smoothing.position !== undefined) s.position = defaults.smoothing.position;
        if (s.rotation === undefined && defaults.smoothing.rotation !== undefined) s.rotation = defaults.smoothing.rotation;
        if (s.fov === undefined && defaults.smoothing.fov !== undefined) s.fov = defaults.smoothing.fov;
      }
    }
  }
  
  @Profile()
  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    void state;
    return activeStateUtils.getPosition(props.activeState);
  }
  
  @HandleError()
  @Profile()
  update(props: CameraCalcProps, state: CameraSystemState): void {
    const { camera, deltaTime, activeState } = props;
    if (!activeState) return;
    this.applyDefaults(state);
    type FocusTarget = { x: number; y: number; z: number };
    type CameraConfigWithFocus = CameraSystemConfig & {
      focus?: boolean;
      focusTarget?: FocusTarget;
      focusDistance?: number;
      focusLerpSpeed?: number;
    };
    const cameraOption = state.config as CameraConfigWithFocus;
    let targetPosition: THREE.Vector3;
    let lookAtTarget: THREE.Vector3;
    if (cameraOption.focus && cameraOption.focusTarget) {
      const focusTarget = this.focusTarget;
      focusTarget.set(
        cameraOption.focusTarget.x,
        cameraOption.focusTarget.y,
        cameraOption.focusTarget.z
      );
      lookAtTarget = focusTarget;
      const distance = cameraOption.focusDistance || 10;
      const direction = this.focusDirection;
      direction.copy(camera.position).sub(focusTarget);
      if (direction.lengthSq() === 0) {
        direction.set(1, 1, 1);
      }
      direction.normalize();

      targetPosition = this.focusTargetPosition.copy(focusTarget).addScaledVector(direction, distance);
    } else {
      targetPosition = this.calculateTargetPosition(props, state);
      lookAtTarget = this.calculateLookAt(props, state);
    }
    const focusLerpSpeed = cameraOption.focusLerpSpeed || 10.0;
    const smoothing = cameraOption.focus ? focusLerpSpeed : 10.0;
    cameraUtils.preventCameraJitter(
      camera, 
      targetPosition, 
      lookAtTarget, 
      smoothing, 
      deltaTime
    );
    
    // FOV 업데이트
    if (state.config.fov && camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(camera, state.config.fov, state.config.smoothing?.fov);
    }
  }
} 