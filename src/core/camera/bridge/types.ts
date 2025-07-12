import { Emitter } from 'mitt';

export type CameraEngineEvents = {
  modeChange: { from: string; to: string };
  positionUpdate: { position: [number, number, number]; target: [number, number, number] };
  configChange: { key: string; value: unknown };
  controllerSwitch: { from: string; to: string };
  error: { message: string; details?: unknown };
};

export interface CameraEngineConfig {
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

export type CameraEngineState = {
  config: CameraEngineConfig;
  metrics: {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
};

export interface ICameraEngineMonitor {
  getState(): CameraEngineState;
  getMetrics(): {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
}

export type CameraEngineEmitter = Emitter<CameraEngineEvents>;