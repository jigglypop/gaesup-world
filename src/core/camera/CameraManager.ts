import * as THREE from 'three';
import { CameraState, CameraController, CameraOption } from './types';
import { controllerMap } from './controllers';
import { CameraEffects } from '../internal/systems/CameraEffects';
import { CameraBlendManager } from '../internal/systems/CameraBlendManager';

export class CameraManager {
  private effects: CameraEffects;
  private blendManager: CameraBlendManager;
  private currentController: CameraController | null = null;

  constructor() {
    this.effects = new CameraEffects();
    this.blendManager = new CameraBlendManager();
  }

  update(state: CameraState): void {
    const { camera, activeState, cameraOption, deltaTime } = state;
    
    if (!activeState || !camera) return;

    const controllerName = this.getControllerName(cameraOption);
    const controller = controllerMap[controllerName];
    
    if (!controller) return;

    this.currentController = controller;

    const targetPosition = controller.calculatePosition(state);
    const lookAtTarget = controller.calculateLookAt?.(state);

    this.applyMovement(camera, targetPosition, lookAtTarget, controller.shouldLerp(), deltaTime);
    this.applyFOV(camera, cameraOption, deltaTime);
    this.effects.update(deltaTime, camera);
  }

  private getControllerName(cameraOption: CameraOption): string {
    return cameraOption.mode || 'thirdPerson';
  }

  private applyMovement(
    camera: THREE.Camera,
    targetPosition: THREE.Vector3,
    lookAtTarget: THREE.Vector3 | undefined,
    shouldLerp: boolean,
    deltaTime: number
  ): void {
    if (shouldLerp) {
      const factor = 1 - Math.exp(-8.0 * deltaTime);
      camera.position.lerp(targetPosition, factor);
    } else {
      camera.position.copy(targetPosition);
    }

    if (lookAtTarget) {
      camera.lookAt(lookAtTarget);
    }
  }

  private applyFOV(camera: THREE.Camera, cameraOption: CameraOption, deltaTime: number): void {
    if (cameraOption.fov && camera instanceof THREE.PerspectiveCamera) {
      const speed = cameraOption.smoothing?.fov || 0.1;
      const factor = 1 - Math.exp(-8.0 * deltaTime);
      camera.fov = THREE.MathUtils.lerp(camera.fov, cameraOption.fov, factor);
      camera.updateProjectionMatrix();
    }
  }

  getEffects(): CameraEffects {
    return this.effects;
  }

  getBlendManager(): CameraBlendManager {
    return this.blendManager;
  }
} 