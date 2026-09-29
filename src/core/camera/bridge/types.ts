import type * as THREE from 'three';

import type { TypedEventBus } from '../../plugins/EventBus';
import type { CameraBounds, CameraCollisionMode, CameraCollisionTargets } from '../core/types';

export type CameraEventValue = object | string | number | boolean | null | undefined;

export type CameraSystemEvents = {
  modeChange: { from: string; to: string };
  positionUpdate: { position: [number, number, number]; target: [number, number, number] };
  configChange: { key: string; value: CameraEventValue };
  controllerSwitch: { from: string; to: string };
  error: { message: string; details?: CameraEventValue };
};

export type CameraSystemConfig = {
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
  collisionTargets?: CameraCollisionTargets;
  collisionMode?: CameraCollisionMode;
  collisionFadeOpacity?: number;
  orbitYaw?: number;
  orbitPitch?: number;
  minDistance?: number;
  /** `undefined` clears a previously configured offset. */
  offset?: { x: number; y: number; z: number } | undefined;
  /** World-space box the camera target stays in; `undefined` removes the limit. */
  bounds?: CameraBounds | undefined;
  /** Where the fixed camera stands; `undefined` falls back to its default. */
  fixedPosition?: THREE.Vector3 | undefined;
  damping?: number;
  enableDamping?: boolean;
};

export type CameraSystemState = {
  config: CameraSystemConfig;
  metrics: {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
};

export type ICameraSystemMonitor = {
  getState(): CameraSystemState;
  getMetrics(): {
    frameCount: number;
    averageFrameTime: number;
    lastUpdateTime: number;
  };
};

export type CameraSystemEmitter = TypedEventBus<CameraSystemEvents>;
