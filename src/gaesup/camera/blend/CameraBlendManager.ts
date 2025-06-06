import * as THREE from 'three';
import { ActiveBlend, CameraBlendState } from './types';

export enum BlendFunction {
  Linear = 'linear',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  Spring = 'spring',
}

export class CameraBlendManager {
  private activeBlend: ActiveBlend | null = null;
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
      onComplete,
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
      this.activeBlend.onComplete?.();
      this.activeBlend = null;
      return false;
    }

    return true;
  }
  private createState(partial: Partial<CameraBlendState>): CameraBlendState {
    return {
      position: partial.position || new THREE.Vector3(),
      rotation: partial.rotation || new THREE.Euler(),
      fov: partial.fov || 75,
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
