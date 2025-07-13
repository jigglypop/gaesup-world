import { Emitter } from 'mitt';

export type CameraSystemEvents = {
  modeChange: { from: string; to: string };
  positionUpdate: { position: [number, number, number]; target: [number, number, number] };
  configChange: { key: string; value: unknown };
  controllerSwitch: { from: string; to: string };
  error: { message: string; details?: unknown };
};

export interface CameraSystemConfig {
  mode: string;
  distance: { x: number; y: number; z: number };
  smoothing: { position: number; rotation: number; fov: number };
  fov: number;
  zoom: number;
  enableCollision: boolean;
  minDistance?: number;
  maxDistance?: number;
  offset?: { x: number; y: number; z: number };
  lookAt?: { x: number; y: number; z: number };
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