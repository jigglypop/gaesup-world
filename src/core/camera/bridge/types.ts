import { Emitter } from 'mitt';

export type CameraEventValue = object | string | number | boolean | null | undefined;

export type CameraSystemEvents = {
  modeChange: { from: string; to: string };
  positionUpdate: { position: [number, number, number]; target: [number, number, number] };
  configChange: { key: string; value: CameraEventValue };
  controllerSwitch: { from: string; to: string };
  error: { message: string; details?: CameraEventValue };
};

export interface CameraSystemConfig {
  mode: string;
  distance: { x: number; y: number; z: number };
  smoothing: { position: number; rotation: number; fov: number };
  fov: number;
  focus?: boolean;
  focusTarget?: { x: number; y: number; z: number } | undefined;
  focusDistance?: number;
  focusLerpSpeed?: number;
  zoom: number;
  enableCollision: boolean;
  collisionMargin?: number;
  orbitYaw?: number;
  orbitPitch?: number;
  minDistance?: number;
  maxDistance?: number;
  /** `undefined` clears a previously configured offset. */
  offset?: { x: number; y: number; z: number } | undefined;
  /** `undefined` clears a previously configured look-at target. */
  lookAt?: { x: number; y: number; z: number } | undefined;
  damping?: number;
  enableDamping?: boolean;
}

export type CameraSystemState = {
  config: CameraSystemConfig;
  metrics: {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
};

export interface ICameraSystemMonitor {
  getState(): CameraSystemState;
  getMetrics(): {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
}

export type CameraSystemEmitter = Emitter<CameraSystemEvents>;
