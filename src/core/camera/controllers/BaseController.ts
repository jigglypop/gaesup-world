import * as THREE from 'three';
import { ICameraController, CameraCalcProps, CameraSystemState, CameraSystemConfig } from '../core/types';
import { activeStateUtils, cameraUtils } from '../utils/camera';

export abstract class BaseController implements ICameraController {
  abstract name: string;
  abstract defaultConfig: Partial<CameraSystemConfig>;
  
  abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
  
  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    return activeStateUtils.getPosition(props.activeState);
  }
  
  update(props: CameraCalcProps, state: CameraSystemState): void {
    const { camera, deltaTime, activeState } = props;
    if (!activeState) return;
    Object.assign(state.config, this.defaultConfig);
    const cameraOption = state.config as any;
    let targetPosition: THREE.Vector3;
    let lookAtTarget: THREE.Vector3;
    if (cameraOption.focus && cameraOption.focusTarget) {
      const focusTarget = new THREE.Vector3(
        cameraOption.focusTarget.x,
        cameraOption.focusTarget.y,
        cameraOption.focusTarget.z
      );
      lookAtTarget = focusTarget;
      const distance = cameraOption.focusDistance || 10;
      const direction = camera.position.clone().sub(focusTarget).normalize();
      if (direction.length() === 0) {
        direction.set(1, 1, 1).normalize();
      }
      targetPosition = focusTarget.clone().add(direction.multiplyScalar(distance));
    } else {
      // 일반 모드
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