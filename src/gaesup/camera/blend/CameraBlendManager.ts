import * as THREE from 'three';
import { CameraActiveBlend, CameraBlendState } from '../../types';
import { eventBus } from '@/gaesup/physics/connectors';

export enum BlendFunction {
  Linear = 'linear',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  Spring = 'spring',
}

export class CameraBlendManager {
  private activeBlend: CameraActiveBlend | null = null;
  private blendFunctions: Record<BlendFunction, (t: number) => number> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    spring: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
  };
  isControllingCamera = false;
  startBlend(
    from: Partial<CameraBlendState>,
    to: Partial<CameraBlendState>,
    duration: number = 1.0,
    blendFunction: BlendFunction = BlendFunction.EaseInOut,
    onComplete?: () => void,
    camera?: THREE.Camera,
  ): void {
    const fromState = this.createState(from, camera);
    const toState = this.createState(to, camera);
    eventBus.emit('CAMERA_BLEND_START', {
      from: fromState,
      to: toState,
      duration,
    });

    const initialQuaternion = new THREE.Quaternion().setFromEuler(fromState.rotation).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromEuler(toState.rotation).normalize();
    if (initialQuaternion.dot(targetQuaternion) < 0) {
      targetQuaternion.multiplyScalar(-1);
    }
    this.activeBlend = {
      from: fromState,
      to: toState,
      duration,
      elapsed: 0,
      blendFunction,
      ...(onComplete && { onComplete }),
      initialQuaternion,
      targetQuaternion,
    };
    this.isControllingCamera = true;
  }
  update(deltaTime: number, camera: THREE.Camera): boolean {
    if (!this.activeBlend) return false;
    this.activeBlend.elapsed += deltaTime;
    const t = Math.min(this.activeBlend.elapsed / this.activeBlend.duration, 1);
    const blendValue = this.blendFunctions[this.activeBlend.blendFunction](t);
    camera.position.lerpVectors(
      this.activeBlend.from.position,
      this.activeBlend.to.position,
      blendValue,
    );
    const fromQuat = new THREE.Quaternion().setFromEuler(this.activeBlend.from.rotation);
    const toQuat = new THREE.Quaternion().setFromEuler(this.activeBlend.to.rotation);
    camera.quaternion.slerpQuaternions(fromQuat, toQuat, blendValue);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(
        this.activeBlend.from.fov,
        this.activeBlend.to.fov,
        blendValue,
      );
      camera.updateProjectionMatrix();
    }
    if (t >= 1) {
      const finalState = this.activeBlend.to;
      eventBus.emit('CAMERA_BLEND_END', {
        finalState,
      });
      this.activeBlend.onComplete?.();
      this.activeBlend = null;
      this.isControllingCamera = false;
      return false;
    }
    return true;
  }
  private createState(partial: Partial<CameraBlendState>, camera?: THREE.Camera): CameraBlendState {
    return {
      position: partial.position || (camera ? camera.position.clone() : new THREE.Vector3()),
      rotation: partial.rotation || (camera ? camera.rotation.clone() : new THREE.Euler()),
      fov: partial.fov || (camera instanceof THREE.PerspectiveCamera ? camera.fov : 75),
      target: partial.target,
    };
  }
  isBlending(): boolean {
    return this.activeBlend !== null;
  }
  stopBlend(): void {
    this.activeBlend = null;
  }
}
