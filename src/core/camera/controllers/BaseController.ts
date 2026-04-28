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
  private focusBasePosition = new THREE.Vector3();
  private focusTargetPosition = new THREE.Vector3();
  private orbitRight = new THREE.Vector3();
  private orbitYawQuaternion = new THREE.Quaternion();
  private orbitPitchQuaternion = new THREE.Quaternion();
  private readonly xAxis = new THREE.Vector3(1, 0, 0);
  private readonly yAxis = new THREE.Vector3(0, 1, 0);

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

  protected applyOrbitOffset(offset: THREE.Vector3, state: CameraSystemState): THREE.Vector3 {
    const orbitYaw = state.config.orbitYaw ?? 0;
    const orbitPitch = state.config.orbitPitch ?? 0;
    if (orbitYaw === 0 && orbitPitch === 0) {
      return offset;
    }

    if (orbitYaw !== 0) {
      this.orbitYawQuaternion.setFromAxisAngle(this.yAxis, orbitYaw);
      offset.applyQuaternion(this.orbitYawQuaternion);
    }

    if (orbitPitch !== 0) {
      this.orbitRight.crossVectors(offset, this.yAxis);
      if (this.orbitRight.lengthSq() <= 1e-6) {
        this.orbitRight.copy(this.xAxis);
      } else {
        this.orbitRight.normalize();
      }
      this.orbitPitchQuaternion.setFromAxisAngle(this.orbitRight, orbitPitch);
      offset.applyQuaternion(this.orbitPitchQuaternion);
    }

    return offset;
  }
  
  @HandleError()
  @Profile()
  update(props: CameraCalcProps, state: CameraSystemState): void {
    const { camera, deltaTime, activeState } = props;
    if (!activeState) return;
    this.applyDefaults(state);
    const cameraOption = state.config;
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
      const basePosition = this.focusBasePosition.copy(this.calculateTargetPosition(props, state));
      const direction = this.focusDirection;
      direction.copy(basePosition).sub(focusTarget);
      if (direction.lengthSq() === 0) {
        direction.copy(camera.position).sub(focusTarget);
      }
      if (direction.lengthSq() === 0) {
        direction.set(1, 1, 1);
      }
      direction.normalize();

      targetPosition = this.focusTargetPosition.copy(focusTarget).addScaledVector(direction, distance);
    } else {
      targetPosition = this.calculateTargetPosition(props, state);
      lookAtTarget = this.calculateLookAt(props, state);
    }
    if (cameraOption.enableCollision) {
      const collision = cameraUtils.improvedCollisionCheck(
        lookAtTarget,
        targetPosition,
        props.scene,
        cameraOption.collisionMargin ?? 0.5,
        props.excludeObjects,
      );
      targetPosition = collision.position;
    }
    const focusLerpSpeed = cameraOption.focusLerpSpeed || 10.0;
    const positionSmoothing = cameraOption.focus
      ? focusLerpSpeed
      : cameraUtils.smoothingToSpeed(cameraOption.smoothing?.position);
    const rotationSmoothing = cameraOption.focus
      ? focusLerpSpeed * 0.8
      : cameraUtils.smoothingToSpeed(cameraOption.smoothing?.rotation, positionSmoothing * 0.8);
    cameraUtils.preventCameraJitter(
      camera, 
      targetPosition, 
      lookAtTarget, 
      positionSmoothing, 
      deltaTime,
      rotationSmoothing
    );
    
    // FOV 업데이트
    if (state.config.fov && camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(camera, state.config.fov, state.config.smoothing?.fov, deltaTime);
    }
  }
} 