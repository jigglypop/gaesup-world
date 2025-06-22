import * as THREE from 'three';
import { CameraOptionType } from '../../types';

interface CameraBlendState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  fov: number;
  target?: THREE.Vector3 | undefined;
}

interface CameraActiveBlend {
  from: CameraBlendState;
  to: CameraBlendState;
  duration: number;
  elapsed: number;
  blendFunction: BlendFunction;
  onComplete?: () => void;
  initialQuaternion: THREE.Quaternion;
  targetQuaternion: THREE.Quaternion;
}

export enum BlendFunction {
  Linear = 'linear',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  Spring = 'spring',
}

export class CameraBlendManager {
  private activeBlend: CameraActiveBlend | null = null;
  private defaultOptions: CameraOptionType;
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

  constructor() {
    this.defaultOptions = {
      xDistance: 15,
      yDistance: 8,
      zDistance: 15,
      fov: 75,
      smoothing: {
        position: 0.1,
        rotation: 0.1,
        fov: 0.1,
      },
    };
  }

  getDefault(): CameraOptionType {
    return { ...this.defaultOptions };
  }

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
      targetQuaternion.multiply(new THREE.Quaternion(-1, -1, -1, -1));
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

  update(currentState: CameraOptionType, deltaTime: number): CameraOptionType {
    if (!this.activeBlend) return currentState;

    this.activeBlend.elapsed += deltaTime;
    const t = Math.min(this.activeBlend.elapsed / this.activeBlend.duration, 1);
    const blendValue = this.blendFunctions[this.activeBlend.blendFunction](t);

    const blendedState: CameraOptionType = {
      ...currentState,
      xDistance: THREE.MathUtils.lerp(
        this.activeBlend.from.position.x,
        this.activeBlend.to.position.x,
        blendValue,
      ),
      yDistance: THREE.MathUtils.lerp(
        this.activeBlend.from.position.y,
        this.activeBlend.to.position.y,
        blendValue,
      ),
      zDistance: THREE.MathUtils.lerp(
        this.activeBlend.from.position.z,
        this.activeBlend.to.position.z,
        blendValue,
      ),
      fov: THREE.MathUtils.lerp(this.activeBlend.from.fov, this.activeBlend.to.fov, blendValue),
    };

    if (t >= 1) {
      this.activeBlend.onComplete?.();
      this.activeBlend = null;
      this.isControllingCamera = false;
    }

    return blendedState;
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
    this.isControllingCamera = false;
  }
} 