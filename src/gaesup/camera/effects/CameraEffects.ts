import * as THREE from 'three';
import { ShakeConfig, ZoomConfig } from './types';
import { eventBus } from '@/gaesup/physics/stores';

export class CameraEffects {
  private shakeState: {
    active: boolean;
    intensity: number;
    duration: number;
    elapsed: number;
    frequency: number;
    decay: boolean;
    originalPosition: THREE.Vector3;
    offset: THREE.Vector3;
  } = {
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    frequency: 10,
    decay: true,
    originalPosition: new THREE.Vector3(),
    offset: new THREE.Vector3(),
  };

  private zoomState: {
    active: boolean;
    startFov: number;
    targetFov: number;
    duration: number;
    elapsed: number;
    easing: (t: number) => number;
  } = {
    active: false,
    startFov: 75,
    targetFov: 75,
    duration: 1,
    elapsed: 0,
    easing: (t) => t,
  };
  private noiseValues: number[] = [];
  constructor() {
    this.generateNoise();
  }
  private generateNoise(): void {
    for (let i = 0; i < 256; i++) {
      this.noiseValues[i] = Math.random() * 2 - 1;
    }
  }
  private noise(x: number): number {
    const i = Math.floor(x) & 255;
    return this.noiseValues[i];
  }
  startShake(config: ShakeConfig): void {
    eventBus.emit('CAMERA_EFFECT', {
      type: 'shake',
      config,
    });
    this.shakeState = {
      active: true,
      intensity: config.intensity,
      duration: config.duration,
      elapsed: 0,
      frequency: config.frequency,
      decay: config.decay,
      originalPosition: new THREE.Vector3(),
      offset: new THREE.Vector3(),
    };
  }
  startZoom(config: ZoomConfig): void {
    eventBus.emit('CAMERA_EFFECT', {
      type: 'zoom',
      config,
    });

    this.zoomState = {
      active: true,
      startFov: this.zoomState.startFov,
      targetFov: config.targetFov,
      duration: config.duration,
      elapsed: 0,
      easing: config.easing,
    };
  }

  update(deltaTime: number, camera: THREE.Camera): void {
    this.updateShake(deltaTime, camera);
    this.updateZoom(deltaTime, camera);
  }

  private updateShake(deltaTime: number, camera: THREE.Camera): void {
    if (!this.shakeState.active) return;

    this.shakeState.elapsed += deltaTime;
    const progress = this.shakeState.elapsed / this.shakeState.duration;

    if (progress >= 1) {
      this.shakeState.active = false;
      camera.position.sub(this.shakeState.offset);
      this.shakeState.offset.set(0, 0, 0);
      return;
    }

    const intensity = this.shakeState.decay
      ? this.shakeState.intensity * (1 - progress)
      : this.shakeState.intensity;

    const time = this.shakeState.elapsed * this.shakeState.frequency;

    const newOffset = new THREE.Vector3(
      this.noise(time) * intensity,
      this.noise(time + 100) * intensity,
      this.noise(time + 200) * intensity,
    );

    camera.position.sub(this.shakeState.offset);
    camera.position.add(newOffset);
    this.shakeState.offset.copy(newOffset);
  }

  private updateZoom(deltaTime: number, camera: THREE.Camera): void {
    if (!this.zoomState.active || !(camera instanceof THREE.PerspectiveCamera)) return;

    if (this.zoomState.elapsed === 0) {
      this.zoomState.startFov = camera.fov;
    }

    this.zoomState.elapsed += deltaTime;
    const progress = Math.min(this.zoomState.elapsed / this.zoomState.duration, 1);

    if (progress >= 1) {
      this.zoomState.active = false;
      camera.fov = this.zoomState.targetFov;
    } else {
      const easedProgress = this.zoomState.easing(progress);
      camera.fov = THREE.MathUtils.lerp(
        this.zoomState.startFov,
        this.zoomState.targetFov,
        easedProgress,
      );
    }

    camera.updateProjectionMatrix();
  }

  stopShake(): void {
    this.shakeState.active = false;
  }

  stopZoom(): void {
    this.zoomState.active = false;
  }

  isShaking(): boolean {
    return this.shakeState.active;
  }

  isZooming(): boolean {
    return this.zoomState.active;
  }

  quickShake(intensity: number = 0.5, duration: number = 0.3): void {
    this.startShake({
      intensity,
      duration,
      frequency: 20,
      decay: true,
    });
  }

  punch(intensity: number = 1.0): void {
    eventBus.emit('CAMERA_EFFECT', {
      type: 'punch',
      config: { intensity, duration: 0.15, frequency: 50, decay: true },
    });

    this.startShake({
      intensity,
      duration: 0.15,
      frequency: 50,
      decay: true,
    });
  }

  earthquake(intensity: number = 0.8, duration: number = 2.0): void {
    eventBus.emit('CAMERA_EFFECT', {
      type: 'earthquake',
      config: { intensity, duration, frequency: 5, decay: false },
    });

    this.startShake({
      intensity,
      duration,
      frequency: 5,
      decay: false,
    });
  }

  zoomIn(targetFov: number = 30, duration: number = 1.0): void {
    this.startZoom({
      targetFov,
      duration,
      easing: (t) => t * t,
    });
  }

  zoomOut(targetFov: number = 90, duration: number = 1.0): void {
    this.startZoom({
      targetFov,
      duration,
      easing: (t) => 1 - Math.pow(1 - t, 2),
    });
  }
}
