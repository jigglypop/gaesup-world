import * as THREE from 'three';
import { ICameraController, CameraCalcProps, CameraSystemState, CameraConfig } from '../core/types';
import { activeStateUtils, cameraUtils } from '../../utils/camera';

export abstract class BaseController implements ICameraController {
  abstract name: string;
  abstract defaultConfig: Partial<CameraConfig>;
  
  abstract calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3;
  
  calculateLookAt(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    return activeStateUtils.getPosition(props.activeState);
  }
  
  update(props: CameraCalcProps, state: CameraSystemState): void {
    const { camera, deltaTime, activeState } = props;
    if (!activeState) return;
    
    // 설정 적용
    Object.assign(state.config, this.defaultConfig);
    
    // 타겟 위치 계산
    const targetPosition = this.calculateTargetPosition(props, state);
    const lookAtTarget = this.calculateLookAt(props, state);
    
    // 기존 방식대로 preventCameraJitter 사용
    cameraUtils.preventCameraJitter(
      camera, 
      targetPosition, 
      lookAtTarget, 
      8.0, 
      deltaTime
    );
    
    // FOV 업데이트
    if (state.config.fov && camera instanceof THREE.PerspectiveCamera) {
      cameraUtils.updateFOV(camera, state.config.fov, state.config.smoothing?.fov);
    }
  }
} 